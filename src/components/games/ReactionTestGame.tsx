import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle, MousePointer, Clock } from 'lucide-react';

interface ReactionTestGameProps {
  onScoreChange: (score: number) => void;
  onGameEnd: () => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

enum GameState {
  READY,
  WAITING,
  CLICK,
  RESULT,
}

interface ReactionRound {
  delay: number; // Delay before target appears in ms
  timeToReact: number | null; // Time taken to react in ms
  targetSize: number; // Size of target in pixels
  targetX: number; // X position of target center (percentage)
  targetY: number; // Y position of target center (percentage)
  timeStarted: number | null; // Timestamp when target appeared
}

const ReactionTestGame = ({ onScoreChange, onGameEnd, difficulty }: ReactionTestGameProps) => {
  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentReaction, setCurrentReaction] = useState<ReactionRound | null>(null);
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<(number | null)[]>([]);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const waitingTimeoutRef = useRef<number | null>(null);
  
  // Define game parameters based on difficulty
  const maxRounds = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 10;
  const delayRange = difficulty === 'easy' ? [1500, 4000] : 
                    difficulty === 'medium' ? [1000, 3500] : 
                    [800, 3000];
  const targetSizeRange = difficulty === 'easy' ? [80, 100] : 
                         difficulty === 'medium' ? [60, 80] : 
                         [40, 60];
  
  // Generate a new target reaction test
  const generateReaction = useCallback(() => {
    // Random delay before target appears
    const delay = Math.floor(Math.random() * (delayRange[1] - delayRange[0])) + delayRange[0];
    
    // Random target size based on difficulty
    const targetSize = Math.floor(Math.random() * (targetSizeRange[1] - targetSizeRange[0])) + targetSizeRange[0];
    
    // Random position (keeping target fully visible)
    const margin = targetSize / 2;
    const targetX = Math.floor(Math.random() * (100 - margin * 2)) + margin;
    const targetY = Math.floor(Math.random() * (100 - margin * 2)) + margin;
    
    return {
      delay,
      timeToReact: null,
      targetSize,
      targetX,
      targetY,
      timeStarted: null,
    };
  }, [delayRange, targetSizeRange]);
  
  // Reset game or proceed to next round
  const handleReadyClick = () => {
    if (currentRound > maxRounds) {
      // Game over
      onGameEnd();
      return;
    }
    
    setGameState(GameState.WAITING);
    const reaction = generateReaction();
    setCurrentReaction(reaction);
    
    // Set timeout for target to appear
    if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current);
    waitingTimeoutRef.current = window.setTimeout(() => {
      setGameState(GameState.CLICK);
      setCurrentReaction(prev => prev ? {
        ...prev,
        timeStarted: Date.now()
      } : null);
    }, reaction.delay);
  };
  
  // Handle early clicks during waiting period
  const handleEarlyClick = () => {
    if (gameState !== GameState.WAITING) return;
    
    // Clear timeout
    if (waitingTimeoutRef.current) {
      clearTimeout(waitingTimeoutRef.current);
      waitingTimeoutRef.current = null;
    }
    
    toast.error("Too early! Wait for the target to appear");
    setGameState(GameState.READY);
  };
  
  // Handle target click
  const handleTargetClick = () => {
    if (gameState !== GameState.CLICK || !currentReaction?.timeStarted) return;
    
    const now = Date.now();
    const reactionTime = now - currentReaction.timeStarted;
    
    // Update reaction time
    const updatedReaction = {
      ...currentReaction,
      timeToReact: reactionTime
    };
    setCurrentReaction(updatedReaction);
    
    // Update roundResults
    const updatedResults = [...roundResults];
    updatedResults[currentRound - 1] = reactionTime;
    setRoundResults(updatedResults);
    
    // Update best time
    if (bestTime === null || reactionTime < bestTime) {
      setBestTime(reactionTime);
    }
    
    // Calculate average time
    const validTimes = updatedResults.filter((time): time is number => time !== null);
    const newAverage = validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
    setAverageTime(newAverage);
    
    // Calculate score for this round
    const baseScore = 1000;
    const roundScore = Math.max(10, Math.floor(baseScore / (reactionTime / 100)));
    
    // Update total score
    const newScore = score + roundScore;
    setScore(newScore);
    onScoreChange(newScore);
    
    toast.success(`${reactionTime}ms - ${getFeedbackMessage(reactionTime)}`);
    
    // Move to result state
    setGameState(GameState.RESULT);
  };
  
  // Get feedback message based on reaction time
  const getFeedbackMessage = (time: number) => {
    if (time < 200) return "Incredible reflexes!";
    if (time < 300) return "Super fast!";
    if (time < 400) return "Great reaction time!";
    if (time < 500) return "Good job!";
    if (time < 600) return "Not bad!";
    return "Keep practicing!";
  };
  
  // Handle next round
  const handleNextRound = () => {
    setCurrentRound(currentRound + 1);
    setGameState(GameState.READY);
  };
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (waitingTimeoutRef.current) {
        clearTimeout(waitingTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="font-medium">Round {currentRound} of {maxRounds}</div>
        <div className="px-3 py-1 bg-muted rounded-full">
          Score: {score}
        </div>
        <div className="px-3 py-1 bg-muted rounded-full">
          {averageTime !== null ? `Avg: ${Math.round(averageTime)}ms` : 'Avg: --'}
        </div>
      </div>
      
      <div 
        ref={gameAreaRef}
        className={`relative min-h-[300px] rounded-xl border overflow-hidden ${
          gameState === GameState.WAITING ? 'bg-muted/50 cursor-not-allowed' :
          gameState === GameState.CLICK ? 'bg-green-100 cursor-pointer' : 'bg-white'
        }`}
        onClick={gameState === GameState.WAITING ? handleEarlyClick : undefined}
      >
        {gameState === GameState.READY && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <MousePointer className="h-12 w-12 mb-4 text-brain-teal animate-bounce" />
            <h3 className="text-xl font-medium mb-2">
              {currentRound === 1 ? 'Test your reaction time!' : 'Get ready for the next round!'}
            </h3>
            <p className="text-muted-foreground mb-6">
              Click as soon as you see the target appear. Wait for the screen to change color.
            </p>
            <Button 
              onClick={handleReadyClick}
              size="lg"
              className="bg-brain-teal hover:bg-brain-teal/90"
            >
              {currentRound === 1 ? 'Start Game' : 'Ready'}
            </Button>
          </div>
        )}
        
        {gameState === GameState.WAITING && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <AlertTriangle className="h-12 w-12 mb-4 text-amber-500" />
            <h3 className="text-xl font-medium mb-2">Wait for it...</h3>
            <p className="text-muted-foreground">
              Don't click yet! Wait for the target to appear.
            </p>
          </div>
        )}
        
        {gameState === GameState.CLICK && currentReaction && (
          <div
            className="absolute bg-brain-coral rounded-full cursor-pointer hover:scale-105 transition-transform"
            style={{
              width: `${currentReaction.targetSize}px`,
              height: `${currentReaction.targetSize}px`,
              left: `calc(${currentReaction.targetX}% - ${currentReaction.targetSize / 2}px)`,
              top: `calc(${currentReaction.targetY}% - ${currentReaction.targetSize / 2}px)`,
            }}
            onClick={handleTargetClick}
          />
        )}
        
        {gameState === GameState.RESULT && currentReaction?.timeToReact && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <Clock className="h-12 w-12 mb-4 text-brain-purple" />
            <h3 className="text-xl font-medium mb-2">Your reaction time</h3>
            <p className="text-4xl font-bold text-brain-purple mb-1">
              {currentReaction.timeToReact}ms
            </p>
            <p className="text-muted-foreground mb-6">
              {getFeedbackMessage(currentReaction.timeToReact)}
            </p>
            <Button 
              onClick={handleNextRound}
              className="bg-brain-purple hover:bg-brain-purple/90"
            >
              {currentRound >= maxRounds ? 'Finish Game' : 'Next Round'}
            </Button>
          </div>
        )}
      </div>
      
      {bestTime !== null && (
        <div className="flex justify-center">
          <div className="text-center">
            <span className="text-sm text-muted-foreground">Best time: </span>
            <span className="font-medium text-brain-teal">{bestTime}ms</span>
          </div>
        </div>
      )}
      
      <div className="text-center text-sm text-muted-foreground">
        {difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard'} difficulty
      </div>
    </div>
  );
};

export default ReactionTestGame;
