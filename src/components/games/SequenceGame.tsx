
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Clock, Star, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SequenceGameProps {
  onScoreChange: (newScore: number) => void;
  onGameEnd: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const SequenceGame = ({ onScoreChange, onGameEnd, difficulty = 'easy' }: SequenceGameProps) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [timePerStep, setTimePerStep] = useState(800); // Time per step in ms, will decrease with level
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // Get appropriate values based on difficulty
  const getDifficultyValues = () => {
    switch(difficulty) {
      case 'easy':
        return { baseLength: 3, baseTime: 800, scoreMultiplier: 1 };
      case 'medium':
        return { baseLength: 4, baseTime: 600, scoreMultiplier: 1.5 };
      case 'hard':
        return { baseLength: 5, baseTime: 400, scoreMultiplier: 2 };
      default:
        return { baseLength: 3, baseTime: 800, scoreMultiplier: 1 };
    }
  };

  // Initialize the game
  useEffect(() => {
    const { baseTime } = getDifficultyValues();
    setTimePerStep(baseTime);
    startNewLevel();
  }, [difficulty]);

  // Handle sequence display
  useEffect(() => {
    if (showingSequence) {
      // Display the sequence to the user
      const sequenceTimer = setTimeout(() => {
        if (currentStep < sequence.length) {
          setCurrentStep(currentStep + 1);
        } else {
          setShowingSequence(false);
          setCurrentStep(-1); // Reset for user input
        }
      }, timePerStep);

      return () => clearTimeout(sequenceTimer);
    }
  }, [showingSequence, currentStep, sequence.length, timePerStep]);

  // Clear feedback after display
  useEffect(() => {
    if (feedback) {
      const feedbackTimer = setTimeout(() => {
        setFeedback(null);
      }, 800);
      return () => clearTimeout(feedbackTimer);
    }
  }, [feedback]);

  // Show level up message briefly
  useEffect(() => {
    if (showLevelUp) {
      const levelUpTimer = setTimeout(() => {
        setShowLevelUp(false);
      }, 1500);
      return () => clearTimeout(levelUpTimer);
    }
  }, [showLevelUp]);

  // Generate a new sequence for the current level
  const generateSequence = () => {
    const { baseLength } = getDifficultyValues();
    const length = baseLength + Math.floor(level / 3); // Slower sequence length increase
    
    return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
  };

  const startNewLevel = () => {
    const newSequence = generateSequence();
    setSequence(newSequence);
    setUserSequence([]);
    setShowingSequence(true);
    setCurrentStep(0);
    setGameOver(false);
    
    // Make game slightly faster as levels progress
    const { baseTime } = getDifficultyValues();
    const newTimePerStep = Math.max(baseTime - (level * 20), 250); // Don't go below 250ms
    setTimePerStep(newTimePerStep);
  };

  const handleNumberClick = (number: number) => {
    if (showingSequence || gameOver) return;

    const newUserSequence = [...userSequence, number];
    setUserSequence(newUserSequence);

    // Check if the user's input matches the sequence so far
    const isCorrect = newUserSequence[newUserSequence.length - 1] === sequence[newUserSequence.length - 1];

    if (!isCorrect) {
      // Wrong number - game over
      setFeedback('incorrect');
      setGameOver(true);
      setStreak(0);
      setComboMultiplier(1);
      const finalScore = score;
      onScoreChange(finalScore);
      
      setTimeout(() => {
        onGameEnd();
      }, 2000);
      
      return;
    }
    
    // Correct input
    setFeedback('correct');

    // If user completed the sequence correctly
    if (newUserSequence.length === sequence.length) {
      // Level completed successfully
      const { scoreMultiplier } = getDifficultyValues();
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Increase combo multiplier every 3 correct sequences
      if (newStreak % 3 === 0) {
        setComboMultiplier(prev => Math.min(prev + 0.5, 3)); // Cap at 3x
      }
      
      const levelPoints = Math.round(sequence.length * 5 * scoreMultiplier * comboMultiplier);
      const newScore = score + levelPoints;
      
      setScore(newScore);
      onScoreChange(newScore);
      setLevel(prevLevel => prevLevel + 1);
      setShowLevelUp(true);
      
      // Short pause before next level
      setTimeout(() => {
        startNewLevel();
      }, 1500);
    }
  };

  // Get color based on difficulty
  const getDifficultyColor = () => {
    switch(difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-blue-500';
      case 'hard': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };
  
  // Get button styling based on game state
  const getButtonStyle = (number: number) => {
    // If showing sequence and this is the current number
    if (showingSequence && currentStep < sequence.length && sequence[currentStep] === number) {
      return 'bg-brain-teal hover:bg-brain-teal/90 text-white';
    }
    
    // If user just pressed this button
    if (!showingSequence && userSequence.length > 0 && 
        userSequence[userSequence.length - 1] === number) {
      return feedback === 'correct' 
        ? 'bg-green-500 hover:bg-green-500/90 text-white' 
        : feedback === 'incorrect' 
          ? 'bg-red-500 hover:bg-red-500/90 text-white'
          : '';
    }
    
    return '';
  };

  return (
    <div className="sequence-game bg-gradient-to-br from-transparent to-brain-teal/5 p-4 rounded-xl">
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-brain-teal" />
          <div className="font-medium">Level {level}</div>
        </div>
        
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <div className="font-medium">{score}</div>
          
          {comboMultiplier > 1 && (
            <div className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              x{comboMultiplier.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {/* Streak indicator */}
      {streak > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Check className="h-3 w-3" /> Streak: {streak}
          </div>
          <Progress value={((streak % 3) / 3) * 100} className="h-1 mt-1" />
        </div>
      )}

      <Card className="p-6 mb-6 text-center relative overflow-hidden">
        {showLevelUp && (
          <div className="absolute inset-0 bg-brain-teal/90 flex items-center justify-center animate-fade-in z-10">
            <div className="text-white text-2xl font-bold">Level Up!</div>
          </div>
        )}
        
        {showingSequence ? (
          <div className="flex flex-col items-center justify-center h-24">
            <div className="text-sm text-muted-foreground mb-2">Memorize the sequence</div>
            <div className="text-4xl font-bold text-brain-teal">
              {currentStep < sequence.length ? sequence[currentStep] : ''}
            </div>
          </div>
        ) : gameOver ? (
          <div className="flex flex-col items-center justify-center h-24 space-y-2">
            <X className="h-8 w-8 text-red-500" />
            <div className="text-xl text-red-500 font-medium">
              Wrong sequence! Game over.
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-24">
            <div className="text-lg mb-2">
              {userSequence.length === 0 ? 
                "Repeat the sequence" : 
                `${userSequence.length}/${sequence.length}`
              }
            </div>
            <div className="flex gap-1">
              {sequence.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-2 w-6 rounded-full ${
                    index < userSequence.length 
                      ? (feedback === 'incorrect' && index === userSequence.length - 1
                        ? 'bg-red-500' 
                        : 'bg-green-500') 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
          <Button
            key={number}
            onClick={() => handleNumberClick(number)}
            disabled={showingSequence || gameOver}
            variant="outline"
            className={`h-16 text-2xl font-medium transition-all duration-300 ${getButtonStyle(number)}`}
          >
            {number}
          </Button>
        ))}
      </div>
      
      {gameOver && (
        <div className="mt-6 text-center">
          <div className="text-lg mb-3">
            Final Score: <span className="font-bold">{score}</span>
          </div>
          <Button 
            onClick={startNewLevel} 
            className="bg-gradient-to-r from-brain-teal to-brain-purple text-white hover:opacity-90"
          >
            Try Again
          </Button>
        </div>
      )}
      
      <div className="mt-4 text-xs text-center text-muted-foreground">
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} mode • Focus Flow • Sequence recall
      </div>
    </div>
  );
};

export default SequenceGame;
