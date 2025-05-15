
import { useState, useEffect, useCallback } from 'react';
import { Brain, Check, X, Clock, Star, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import FloatingElement from '@/components/FloatingElement';
import AnimateOnScroll from '@/components/AnimateOnScroll';

interface WordGameProps {
  onScoreChange: (score: number) => void;
  onGameEnd: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

type Puzzle = {
  question: string;
  answers: string[];
  correctAnswer: string;
  hint?: string;
  category: 'wordplay' | 'riddle' | 'logic';
};

const WordGame = ({ onScoreChange, onGameEnd, difficulty = 'medium' }: WordGameProps) => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [puzzleHistory, setPuzzleHistory] = useState<number[]>([]);
  
  // Get puzzles based on difficulty
  const getPuzzles = useCallback(() => {
    const allPuzzles: Puzzle[] = [
      {
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answers: ["Echo", "Shadow", "Thought", "Dream"],
        correctAnswer: "Echo",
        category: 'riddle'
      },
      {
        question: "What has keys but no locks, space but no room, and you can enter but not go in?",
        answers: ["Keyboard", "Piano", "Map", "Book"],
        correctAnswer: "Keyboard",
        category: 'riddle'
      },
      {
        question: "I'm tall when I'm young, and I'm short when I'm old. What am I?",
        answers: ["Candle", "Tree", "Shadow", "Person"],
        correctAnswer: "Candle",
        category: 'riddle',
        hint: "I give light..."
      },
      {
        question: "Rearrange the letters: TAPED CAR",
        answers: ["Carpeted", "Departed", "Catered", "Traced"],
        correctAnswer: "Carpeted",
        category: 'wordplay',
        hint: "Think about what covers a floor"
      },
      {
        question: "What word becomes shorter when you add two letters to it?",
        answers: ["Short", "Long", "Slim", "Tall"],
        correctAnswer: "Short",
        category: 'wordplay',
        hint: "Adding -er makes a comparison"
      },
      {
        question: "If two people can make two widgets in two minutes, how many widgets can six people make in six minutes?",
        answers: ["6", "12", "18", "36"],
        correctAnswer: "18",
        category: 'logic',
        hint: "Calculate the rate per person per minute"
      },
      {
        question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
        answers: ["$0.05", "$0.10", "$0.15", "$1.00"],
        correctAnswer: "$0.05",
        category: 'logic'
      },
      {
        question: "Find the missing letter: A, D, G, J, ?",
        answers: ["L", "M", "N", "O"],
        correctAnswer: "M",
        category: 'logic',
        hint: "Count the jumps between letters"
      },
      {
        question: "Unscramble: CIPALEN",
        answers: ["Eclipse", "Pencil", "Alpine", "Pelican"],
        correctAnswer: "Pencil",
        category: 'wordplay'
      },
      {
        question: "I have a head, a tail, but no body. What am I?",
        answers: ["Snake", "Coin", "Arrow", "Kite"],
        correctAnswer: "Coin",
        category: 'riddle'
      },
      {
        question: "Which word doesn't belong? Cat, Dog, Horse, Elephant, Pen",
        answers: ["Cat", "Dog", "Horse", "Pen"],
        correctAnswer: "Pen",
        category: 'logic',
        hint: "Think about what these words represent"
      },
      {
        question: "Rearrange: FULBTAEIUW",
        answers: ["Beautiful", "Bountiful", "Butterfly", "Faithful"],
        correctAnswer: "Beautiful",
        category: 'wordplay'
      }
    ];

    // Filter and adjust difficulty
    let filteredPuzzles: Puzzle[];
    switch (difficulty) {
      case 'easy':
        filteredPuzzles = allPuzzles.filter(p => p.category === 'wordplay' || p.hint);
        break;
      case 'hard':
        filteredPuzzles = allPuzzles.filter(p => p.category === 'logic' || !p.hint);
        break;
      default:
        filteredPuzzles = allPuzzles;
    }

    return filteredPuzzles;
  }, [difficulty]);

  // Get a random puzzle that hasn't been used recently
  const getRandomPuzzle = useCallback(() => {
    const puzzles = getPuzzles();
    let availablePuzzles = puzzles.filter((_, index) => !puzzleHistory.includes(index));
    
    if (availablePuzzles.length === 0) {
      // Reset history if all puzzles have been used
      setPuzzleHistory([]);
      availablePuzzles = puzzles;
    }
    
    const randomIndex = Math.floor(Math.random() * availablePuzzles.length);
    const puzzleIndex = puzzles.indexOf(availablePuzzles[randomIndex]);
    
    // Record this puzzle as used
    setPuzzleHistory(prev => [...prev, puzzleIndex]);
    
    return availablePuzzles[randomIndex];
  }, [getPuzzles, puzzleHistory]);

  // Start a new puzzle
  const startNewPuzzle = useCallback(() => {
    const puzzle = getRandomPuzzle();
    setCurrentPuzzle(puzzle);
    setSelectedAnswer(null);
    setShowFeedback(null);
    setShowHint(false);
    setBonusPoints(0);
    
    // Adjust time based on difficulty and level
    const baseTime = difficulty === 'easy' ? 45 : 
                     difficulty === 'medium' ? 30 : 20;
    setTimeRemaining(Math.max(10, baseTime - Math.floor(level / 3) * 2));
  }, [getRandomPuzzle, difficulty, level]);

  // Timer effect
  useEffect(() => {
    if (!currentPuzzle || showFeedback || gameOver) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAnswer(null); // Time's up
          return 0;
        }
        // Calculate bonus points based on time
        if (prev > 5) {
          setBonusPoints(Math.floor(prev / 3));
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPuzzle, showFeedback, gameOver]);

  // Initialize game
  useEffect(() => {
    startNewPuzzle();
  }, [startNewPuzzle]);

  // Handle level up animation
  useEffect(() => {
    if (showLevelUp) {
      const timer = setTimeout(() => {
        setShowLevelUp(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showLevelUp]);

  // Handle answer selection
  const handleAnswer = (answer: string | null) => {
    if (!currentPuzzle || showFeedback) return;
    
    setSelectedAnswer(answer);
    
    // Check if answer is correct
    if (answer === currentPuzzle.correctAnswer) {
      setShowFeedback('correct');
      
      // Calculate score based on difficulty, level, and time
      const difficultyMultiplier = difficulty === 'easy' ? 1 : 
                                  difficulty === 'medium' ? 1.5 : 2;
      const basePoints = 10 * difficultyMultiplier;
      const timeBonus = bonusPoints;
      const levelBonus = Math.floor(level / 2);
      const newStreakCount = streakCount + 1;
      setStreakCount(newStreakCount);
      
      // Streak bonus
      const streakMultiplier = Math.min(2, 1 + (newStreakCount * 0.1));
      
      const totalPoints = Math.round((basePoints + timeBonus + levelBonus) * streakMultiplier);
      const newScore = score + totalPoints;
      
      setScore(newScore);
      onScoreChange(newScore);
      
      // Show correct feedback briefly then move to next level
      setTimeout(() => {
        setLevel(prev => prev + 1);
        setShowLevelUp(true);
        
        // Delay starting the next puzzle to show level up animation
        setTimeout(() => {
          startNewPuzzle();
        }, 1500);
      }, 1500);
    } else {
      // Wrong answer
      setShowFeedback('incorrect');
      setStreakCount(0);
      
      setTimeout(() => {
        if (answer === null) {
          // Time's up - game over
          setGameOver(true);
          onScoreChange(score);
          onGameEnd();
        } else {
          // Wrong answer but continue
          startNewPuzzle();
        }
      }, 1500);
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'wordplay': return <Brain className="h-4 w-4" />;
      case 'riddle': return <Sparkles className="h-4 w-4" />;
      case 'logic': return <Star className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  // Get color scheme based on difficulty
  const getDifficultyColor = () => {
    switch(difficulty) {
      case 'easy': return {
        bg: 'from-green-50 to-green-100',
        accent: 'bg-green-600',
        light: 'bg-green-100',
        text: 'text-green-700'
      };
      case 'hard': return {
        bg: 'from-purple-50 to-purple-100',
        accent: 'bg-purple-600',
        light: 'bg-purple-100',
        text: 'text-purple-700'
      };
      default: return {
        bg: 'from-brain-teal/5 to-brain-purple/5',
        accent: 'bg-brain-teal',
        light: 'bg-brain-teal/10',
        text: 'text-brain-teal'
      };
    }
  };

  const colors = getDifficultyColor();

  return (
    <div className={`puzzle-solver bg-gradient-to-br ${colors.bg} p-4 rounded-xl`}>
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-brain-purple" />
          <div className="font-medium">Level {level}</div>
          {streakCount > 0 && (
            <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full flex items-center">
              <Award className="h-3 w-3 mr-1" /> 
              {streakCount} streak
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Clock className={`h-4 w-4 ${timeRemaining < 5 ? 'text-red-500' : 'text-muted-foreground'}`} />
            <span className={`${timeRemaining < 5 ? 'text-red-500 font-bold' : ''}`}>
              {timeRemaining}s
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{score}</span>
            {bonusPoints > 0 && !showFeedback && (
              <span className="text-xs text-green-600">+{bonusPoints}</span>
            )}
          </div>
        </div>
      </div>
      
      {streakCount > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Streak bonus</span>
            <span>x{Math.min(2, (1 + (streakCount * 0.1))).toFixed(1)}</span>
          </div>
          <Progress 
            value={Math.min(100, (streakCount / 10) * 100)} 
            className={`h-1 ${colors.accent}`}
          />
        </div>
      )}
      
      <Card className="relative overflow-hidden">
        {showLevelUp && (
          <div className="absolute inset-0 bg-brain-teal/90 flex items-center justify-center animate-fade-in z-20">
            <FloatingElement speed="medium">
              <div className="text-white text-2xl font-bold flex items-center">
                <Sparkles className="mr-2 h-6 w-6" />
                Level Up!
              </div>
            </FloatingElement>
          </div>
        )}
        
        <CardContent className="p-6 text-center relative">
          {currentPuzzle && (
            <>
              <div className="mb-6">
                <div className="flex justify-center mb-2">
                  <div className={`${colors.light} ${colors.text} text-xs px-3 py-1 rounded-full flex items-center`}>
                    {getCategoryIcon(currentPuzzle.category)}
                    <span className="ml-1 capitalize">{currentPuzzle.category} Puzzle</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{currentPuzzle.question}</h3>
                
                {showHint && currentPuzzle.hint && (
                  <AnimateOnScroll animation="animate-fade-in" className="my-3">
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm">
                      <span className="font-medium">Hint:</span> {currentPuzzle.hint}
                    </div>
                  </AnimateOnScroll>
                )}
                
                {!showHint && currentPuzzle.hint && !showFeedback && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => setShowHint(true)}
                  >
                    Show Hint
                  </Button>
                )}
              </div>
              
              {showFeedback ? (
                <div className={`py-4 px-6 rounded-lg ${
                  showFeedback === 'correct' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-center justify-center">
                    {showFeedback === 'correct' ? (
                      <>
                        <Check className="h-6 w-6 mr-2 text-green-600" />
                        <span className="font-medium">Correct!</span>
                      </>
                    ) : (
                      <>
                        <X className="h-6 w-6 mr-2 text-red-600" />
                        <span className="font-medium">
                          {selectedAnswer ? 'Incorrect!' : 'Time\'s up!'}
                        </span>
                      </>
                    )}
                  </div>
                  {showFeedback === 'incorrect' && (
                    <div className="mt-2 text-sm">
                      The correct answer was: <span className="font-medium">{currentPuzzle.correctAnswer}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {currentPuzzle.answers.map((answer, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      className={`py-6 text-lg hover:bg-muted/80 ${
                        selectedAnswer === answer ? 'border-brain-teal border-2' : ''
                      }`}
                      onClick={() => handleAnswer(answer)}
                    >
                      {answer}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {gameOver && (
        <div className="mt-6 text-center">
          <div className="text-lg mb-3">
            Final Score: <span className="font-bold">{score}</span>
          </div>
          <Button 
            onClick={() => {
              setGameOver(false);
              setScore(0);
              setLevel(1);
              setStreakCount(0);
              startNewPuzzle();
            }} 
            className="bg-gradient-to-r from-brain-teal to-brain-purple text-white hover:opacity-90"
          >
            Try Again
          </Button>
        </div>
      )}
      
      <div className="mt-4 text-xs text-center text-muted-foreground">
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} mode • Puzzle Solver • Logic & word puzzles
      </div>
    </div>
  );
};

export default WordGame;
