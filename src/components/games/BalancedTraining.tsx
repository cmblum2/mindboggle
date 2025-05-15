
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Star, CheckCircle, Trophy, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { fadeIn, fadeInLeft } from '@/lib/animate';
import FloatingElement from '@/components/FloatingElement';

interface BalancedTrainingProps {
  onScoreChange: (score: number) => void;
  onGameEnd: () => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

const BalancedTraining = ({ onScoreChange, onGameEnd, difficulty }: BalancedTrainingProps) => {
  const [currentGame, setCurrentGame] = useState<'memory' | 'focus' | 'speed'>('memory');
  const [gameIndex, setGameIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per mini-game
  const [gameData, setGameData] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  
  // Game modes config based on difficulty
  const gameModes = {
    easy: {
      sequenceLength: 3,
      timePerGame: 20,
      gridSize: 3
    },
    medium: {
      sequenceLength: 6,
      timePerGame: 15,
      gridSize: 4
    },
    hard: {
      sequenceLength: 9,
      timePerGame: 12,
      gridSize: 5
    }
  };

  // Generate daily seed based on the current date
  const getDailySeed = () => {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  };

  // Pseudo-random number generator using the daily seed
  const getRandomNumber = (min: number, max: number, seed: number) => {
    const x = Math.sin(seed) * 10000;
    const randomValue = x - Math.floor(x);
    return Math.floor(randomValue * (max - min + 1)) + min;
  };

  // Initialize game sequence based on daily seed
  useEffect(() => {
    const dailySeed = getDailySeed();
    const gameSequence = [];
    const sequenceLength = gameModes[difficulty].sequenceLength;
    
    for (let i = 0; i < sequenceLength; i++) {
      const gameTypeIndex = getRandomNumber(0, 2, dailySeed + i);
      const gameType = ['memory', 'focus', 'speed'][gameTypeIndex] as 'memory' | 'focus' | 'speed';
      gameSequence.push(gameType);
    }
    
    // Initialize with the first game
    setCurrentGame(gameSequence[0]);
    generateGameData(gameSequence[0], dailySeed);
    
    // Reset game state
    setTotalScore(0);
    setGameIndex(0);
    setStreak(0);
  }, [difficulty]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showFeedback) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          // Show warning when time is low
          if (prev === 5) {
            setShowTimerWarning(true);
            setTimeout(() => setShowTimerWarning(false), 800);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      handleAnswer(null); // Time's up
    }
  }, [timeLeft, showFeedback]);

  // Generate game data based on the current game type
  const generateGameData = (gameType: 'memory' | 'focus' | 'speed', seed: number) => {
    const config = gameModes[difficulty];
    
    switch (gameType) {
      case 'memory':
        // Generate a sequence of numbers to remember
        const sequenceLength = 3 + (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3);
        const sequence = [];
        for (let i = 0; i < sequenceLength; i++) {
          sequence.push(getRandomNumber(1, 9, seed + i * 100));
        }
        
        // Generate answer options (including the correct one)
        const correctAnswer = sequence.join('');
        const answerOptions = [correctAnswer];
        
        // Generate 3 incorrect options that are similar but different
        while (answerOptions.length < 4) {
          const modifiedSequence = [...sequence];
          // Change 1-2 digits
          const changesToMake = difficulty === 'easy' ? 1 : 2;
          for (let j = 0; j < changesToMake; j++) {
            const posToChange = getRandomNumber(0, modifiedSequence.length - 1, seed + 500 + j);
            let newDigit = getRandomNumber(1, 9, seed + 600 + j);
            // Make sure we're changing to a different digit
            while (newDigit === modifiedSequence[posToChange]) {
              newDigit = getRandomNumber(1, 9, seed + 600 + j + 100);
            }
            modifiedSequence[posToChange] = newDigit;
          }
          
          const wrongAnswer = modifiedSequence.join('');
          if (!answerOptions.includes(wrongAnswer)) {
            answerOptions.push(wrongAnswer);
          }
        }
        
        // Shuffle the options
        const shuffledOptions = [...answerOptions];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(getRandomNumber(0, i, seed + 800 + i));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        setGameData({ 
          sequence, 
          displayMode: true, 
          options: shuffledOptions,
          correctAnswerIndex: shuffledOptions.indexOf(correctAnswer)
        });
        
        // Hide sequence after a few seconds (longer for easier difficulty)
        setTimeout(() => setGameData(prev => ({ ...prev, displayMode: false })), 
          difficulty === 'easy' ? 4000 : difficulty === 'medium' ? 3000 : 2000);
        break;
        
      case 'focus':
        // Generate a pattern matching puzzle with multiple choice
        const gridSize = config.gridSize;
        const target = getRandomNumber(1, 9, seed);
        const grid = [];
        
        for (let i = 0; i < gridSize; i++) {
          const row = [];
          for (let j = 0; j < gridSize; j++) {
            const value = getRandomNumber(1, 9, seed + i * 10 + j);
            row.push(value);
          }
          grid.push(row);
        }
        
        // Count targets in grid
        const targetsCount = grid.flat().filter(num => num === target).length;
        
        // Generate answer options around the correct answer
        const focusOptions = [];
        
        // Add correct answer
        focusOptions.push(targetsCount);
        
        // Add close but wrong answers
        while (focusOptions.length < 4) {
          let offset = getRandomNumber(1, 3, seed + focusOptions.length * 100);
          if (Math.random() > 0.5) offset = -offset;
          
          const wrongAnswer = Math.max(0, targetsCount + offset);
          if (!focusOptions.includes(wrongAnswer)) {
            focusOptions.push(wrongAnswer);
          }
        }
        
        // Shuffle options
        const shuffledFocusOptions = [...focusOptions];
        for (let i = shuffledFocusOptions.length - 1; i > 0; i--) {
          const j = Math.floor(getRandomNumber(0, i, seed + 700 + i));
          [shuffledFocusOptions[i], shuffledFocusOptions[j]] = [shuffledFocusOptions[j], shuffledFocusOptions[i]];
        }
        
        setGameData({ 
          grid, 
          target, 
          options: shuffledFocusOptions,
          correctAnswerIndex: shuffledFocusOptions.indexOf(targetsCount)
        });
        break;
        
      case 'speed':
        // Generate a quick math problem with multiple choice
        const operations = ['+', '-', '*'];
        const operation = operations[getRandomNumber(0, 2, seed)];
        
        // Adjust number ranges based on difficulty
        const maxNum1 = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
        const maxNum2 = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
        
        const num1 = getRandomNumber(1, maxNum1, seed + 1);
        const num2 = getRandomNumber(1, maxNum2, seed + 2);
        
        let answer;
        switch (operation) {
          case '+': answer = num1 + num2; break;
          case '-': answer = num1 - num2; break;
          case '*': answer = num1 * num2; break;
          default: answer = num1 + num2;
        }
        
        // Generate options (including correct answer)
        const mathOptions = [answer];
        
        // Generate wrong but close answers
        while (mathOptions.length < 4) {
          let offset = getRandomNumber(1, Math.max(5, Math.floor(answer / 4)), seed + mathOptions.length * 50);
          if (Math.random() > 0.5) offset = -offset;
          
          const wrongAnswer = Math.max(0, answer + offset);
          if (!mathOptions.includes(wrongAnswer)) {
            mathOptions.push(wrongAnswer);
          }
        }
        
        // Shuffle options
        const shuffledMathOptions = [...mathOptions];
        for (let i = shuffledMathOptions.length - 1; i > 0; i--) {
          const j = Math.floor(getRandomNumber(0, i, seed + 900 + i));
          [shuffledMathOptions[i], shuffledMathOptions[j]] = [shuffledMathOptions[j], shuffledMathOptions[i]];
        }
        
        setGameData({ 
          num1, 
          num2, 
          operation, 
          options: shuffledMathOptions,
          correctAnswerIndex: shuffledMathOptions.indexOf(answer)
        });
        break;
    }
    
    // Reset for the new mini-game
    setTimeLeft(config.timePerGame);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  // Handle user's answer
  const handleAnswer = (answerIndex: number | null) => {
    if (showFeedback) return; // Prevent multiple submissions
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    // Check if answer is correct
    const correct = answerIndex === gameData?.correctAnswerIndex;
    
    setIsCorrect(correct);
    
    // Update streak
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Show streak animation for streaks of 3 or more
      if (newStreak >= 3) {
        setShowStreak(true);
        setTimeout(() => setShowStreak(false), 1500);
      }
      
      // Calculate points with streak bonus
      const basePoints = 10;
      const timeBonus = timeLeft * 2;
      const streakMultiplier = Math.min(2, 1 + (newStreak * 0.1)); // Max 2x multiplier
      
      const points = Math.round((basePoints + timeBonus) * streakMultiplier);
      const newTotalScore = totalScore + points;
      
      setTotalScore(newTotalScore);
      onScoreChange(newTotalScore);
      
      // Animate score
      setScoreAnimation(true);
      setTimeout(() => setScoreAnimation(false), 800);
    } else {
      // Reset streak on wrong answer
      setStreak(0);
    }
    
    // Show feedback briefly
    setTimeout(() => {
      setShowFeedback(false);
      moveToNextGame();
    }, 1500);
  };

  // Move to the next game or end if all games are completed
  const moveToNextGame = () => {
    const dailySeed = getDailySeed();
    const nextIndex = gameIndex + 1;
    const sequenceLength = gameModes[difficulty].sequenceLength;
    
    if (nextIndex < sequenceLength) {
      setGameIndex(nextIndex);
      const gameTypeIndex = getRandomNumber(0, 2, dailySeed + nextIndex);
      const gameType = ['memory', 'focus', 'speed'][gameTypeIndex] as 'memory' | 'focus' | 'speed';
      setCurrentGame(gameType);
      generateGameData(gameType, dailySeed + nextIndex * 1000);
    } else {
      // Game completed
      onGameEnd();
    }
  };

  // Get color scheme based on current game type
  const getGameColors = () => {
    switch(currentGame) {
      case 'memory':
        return {
          primary: 'text-brain-purple',
          border: 'border-brain-purple/30',
          bg: 'bg-brain-purple/10',
          buttonHover: 'hover:bg-brain-purple/20',
          buttonActive: 'bg-brain-purple',
          icon: <Brain className="h-5 w-5 text-brain-purple" />
        };
      case 'focus':
        return {
          primary: 'text-brain-teal',
          border: 'border-brain-teal/30',
          bg: 'bg-brain-teal/10',
          buttonHover: 'hover:bg-brain-teal/20',
          buttonActive: 'bg-brain-teal',
          icon: <Zap className="h-5 w-5 text-brain-teal" />
        };
      case 'speed':
        return {
          primary: 'text-brain-coral',
          border: 'border-brain-coral/30',
          bg: 'bg-brain-coral/10',
          buttonHover: 'hover:bg-brain-coral/20',
          buttonActive: 'bg-brain-coral',
          icon: <Clock className="h-5 w-5 text-brain-coral" />
        };
      default:
        return {
          primary: 'text-brain-teal',
          border: 'border-brain-teal/30',
          bg: 'bg-brain-teal/10',
          buttonHover: 'hover:bg-brain-teal/20',
          buttonActive: 'bg-brain-teal',
          icon: <Brain className="h-5 w-5 text-brain-teal" />
        };
    }
  };

  const colors = getGameColors();

  // Render the current game
  const renderGame = () => {
    if (showFeedback) {
      return (
        <AnimateOnScroll animation={fadeIn(100)} className="w-full">
          <div className={`flex flex-col items-center justify-center space-y-4 p-8 rounded-xl ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`text-4xl ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
              {isCorrect 
                ? <CheckCircle className="h-16 w-16" />
                : <div className="text-2xl font-medium">Incorrect!</div>
              }
            </div>
            <div className="text-lg mt-4">
              {isCorrect 
                ? <span className="font-medium text-green-600">+{10 + (timeLeft * 2)} points</span> 
                : <span className="text-red-600">Try again on the next challenge!</span>
              }
            </div>
          </div>
        </AnimateOnScroll>
      );
    }
    
    switch (currentGame) {
      case 'memory':
        return (
          <div className="space-y-6 p-4 text-center">
            <div className={`text-lg font-medium ${colors.primary} mb-4`}>
              Remember this sequence
            </div>
            
            {gameData?.displayMode ? (
              <div className="text-3xl font-bold tracking-widest animate-pulse">
                {gameData?.sequence?.join(' ')}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-lg mb-4">Select the correct sequence:</div>
                <div className="grid grid-cols-1 gap-3">
                  {gameData?.options.map((option: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      className={cn(
                        "py-6 text-lg justify-center", 
                        colors.border,
                        selectedAnswer === index ? colors.buttonActive + ' text-white' : colors.buttonHover
                      )}
                      onClick={() => handleAnswer(index)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'focus':
        return (
          <div className="space-y-6 p-4 text-center">
            <div className={`text-lg font-medium ${colors.primary} mb-2`}>
              Count how many times you see the number: <span className="text-2xl font-bold">{gameData?.target}</span>
            </div>
            
            <div className="grid gap-2 mx-auto max-w-md" style={{ 
              gridTemplateColumns: `repeat(${Math.sqrt(gameData?.grid?.flat().length || 9)}, 1fr)` 
            }}>
              {gameData?.grid?.flat().map((num: number, idx: number) => (
                <Card key={idx} className={`aspect-square flex items-center justify-center ${colors.border} ${num === gameData?.target ? colors.bg : ''}`}>
                  <CardContent className="p-0 flex items-center justify-center h-full">
                    <span className="text-xl font-medium">{num}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="text-lg mb-2">How many {gameData?.target}'s did you count?</div>
              <div className="grid grid-cols-2 gap-3">
                {gameData?.options.map((option: number, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    className={cn(
                      "py-6 text-lg", 
                      colors.border,
                      selectedAnswer === index ? colors.buttonActive + ' text-white' : colors.buttonHover
                    )}
                    onClick={() => handleAnswer(index)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'speed':
        return (
          <div className="space-y-6 p-4 text-center">
            <div className={`text-lg font-medium ${colors.primary} mb-4`}>
              Solve this math problem quickly!
            </div>
            
            <div className="text-3xl font-bold mb-6">
              {gameData?.num1} {gameData?.operation} {gameData?.num2} = ?
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {gameData?.options.map((option: number, index: number) => (
                <Button
                  key={index}
                  variant="outline" 
                  size="lg"
                  className={cn(
                    "py-6 text-lg", 
                    colors.border,
                    selectedAnswer === index ? colors.buttonActive + ' text-white' : colors.buttonHover
                  )}
                  onClick={() => handleAnswer(index)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="balanced-training-container relative">
      {/* Streak animation overlay */}
      {showStreak && (
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 to-transparent z-10 pointer-events-none flex items-center justify-center">
          <FloatingElement speed="fast">
            <div className="flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full shadow-lg">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              <span className="text-lg font-bold">{streak} Streak!</span>
            </div>
          </FloatingElement>
        </div>
      )}

      {/* Timer warning flash */}
      {showTimerWarning && (
        <div className="absolute inset-0 bg-red-500/10 z-5 pointer-events-none animate-pulse"></div>
      )}
      
      <Card className={cn(
        "border transition-all duration-300", 
        colors.border,
        colors.bg
      )}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              {colors.icon}
              <span className={`font-medium ml-2 ${colors.primary}`}>{
                currentGame === 'memory' ? 'Memory Challenge' : 
                currentGame === 'focus' ? 'Focus Challenge' : 
                'Speed Challenge'
              }</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <AnimateOnScroll animation={fadeIn(100)} key={`score-${totalScore}`} className="flex items-center">
                <Star className={`h-4 w-4 mr-1 text-yellow-500 ${scoreAnimation ? 'animate-ping' : ''}`} />
                <span className={`${scoreAnimation ? 'font-bold' : ''}`}>{totalScore}</span>
              </AnimateOnScroll>
              
              <AnimateOnScroll animation={fadeIn(100)} key={`timer-${timeLeft}`} className="flex items-center">
                <Clock className={`h-4 w-4 mr-1 ${timeLeft < 5 ? 'text-red-500 animate-pulse' : ''}`} />
                <span className={`${timeLeft < 5 ? 'text-red-500 font-bold' : ''}`}>{timeLeft}s</span>
              </AnimateOnScroll>
            </div>
          </div>
          
          {/* Streak indicator */}
          {streak > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Streak bonus x{Math.min(2, (1 + (streak * 0.1))).toFixed(1)}</span>
                <span>{streak} {streak === 1 ? 'correct answer' : 'correct answers'} in a row</span>
              </div>
              <Progress 
                value={Math.min(100, (streak / 10) * 100)} 
                className={`h-1.5 ${
                  currentGame === 'memory' ? 'bg-brain-purple' :
                  currentGame === 'focus' ? 'bg-brain-teal' :
                  'bg-brain-coral'
                }`}
              />
            </div>
          )}
          
          <div className="game-content min-h-[350px] rounded-xl p-4 flex flex-col justify-center bg-white border">
            {renderGame()}
          </div>
          
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>Game {gameIndex + 1} of {gameModes[difficulty].sequenceLength}</span>
            <span className="flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-yellow-400" />
              Daily Brain Challenge
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalancedTraining;
