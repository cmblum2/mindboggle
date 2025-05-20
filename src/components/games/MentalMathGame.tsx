
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MentalMathGameProps {
  onScoreChange: (score: number) => void;
  onGameEnd: () => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface MathProblem {
  num1: number;
  num2: number;
  operation: '+' | '-' | '*' | '/';
  answer: number;
  options: number[];
}

const MentalMathGame = ({ onScoreChange, onGameEnd, difficulty }: MentalMathGameProps) => {
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  const maxRounds = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 10;
  const timeLimit = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 8 : 6;
  
  // Generate a math problem based on difficulty
  const generateProblem = useCallback(() => {
    const operations: ('+' | '-' | '*' | '/')[] = difficulty === 'easy' ? ['+', '-'] : 
                                                 difficulty === 'medium' ? ['+', '-', '*'] : 
                                                 ['+', '-', '*', '/'];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    // Determine number ranges based on difficulty
    let num1Range = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100;
    let num2Range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 25 : 50;
    
    let num1 = Math.floor(Math.random() * num1Range) + 1;
    let num2 = Math.floor(Math.random() * num2Range) + 1;
    let answer: number;
    
    // Ensure division problems have whole number answers
    if (operation === '/') {
      // For division, first calculate the answer, then derive num1
      num2 = Math.floor(Math.random() * 12) + 1; // Smaller number for division
      const possibleAnswer = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * possibleAnswer; // This ensures clean division
      answer = num1 / num2;
    } else {
      // For other operations
      // For subtraction, ensure result is positive
      if (operation === '-' && num2 > num1) {
        [num1, num2] = [num2, num1];
      }
      
      // Calculate answer
      switch (operation) {
        case '+': answer = num1 + num2; break;
        case '-': answer = num1 - num2; break;
        case '*': answer = num1 * num2; break;
        default: answer = num1; // Shouldn't happen
      }
    }
    
    // Generate answer options
    const options = [answer];
    
    // Add incorrect but plausible options
    while (options.length < 4) {
      let variation = Math.floor(Math.random() * (num1Range / 2)) + 1;
      let sign = Math.random() > 0.5 ? 1 : -1;
      let wrongAnswer = answer + (sign * variation);
      
      // Ensure no negative answers and no duplicates
      if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    return {
      num1,
      num2,
      operation,
      answer,
      options: shuffledOptions
    };
  }, [difficulty]);
  
  // Initialize game
  useEffect(() => {
    setProblem(generateProblem());
    setTimeLeft(timeLimit);
  }, [generateProblem, timeLimit]);
  
  // Time counter
  useEffect(() => {
    if (isAnswered || !problem) return;
    
    const timer = setTimeout(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        // Time's up
        setFeedback('incorrect');
        setIsAnswered(true);
        toast.error("Time's up!");
        setTimeout(nextRound, 2000);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, isAnswered, problem]);
  
  const handleOptionSelect = (option: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    if (option === problem?.answer) {
      // Correct answer
      const roundScore = calculateScore();
      setScore(prevScore => prevScore + roundScore);
      onScoreChange(score + roundScore);
      setFeedback('correct');
      toast.success(`Correct! +${roundScore} points`);
    } else {
      // Incorrect answer
      setFeedback('incorrect');
      toast.error("Incorrect answer!");
    }
    
    // Move to next round after a short delay
    setTimeout(nextRound, 2000);
  };
  
  const calculateScore = () => {
    // Score is based on difficulty and time left
    const difficultyMultiplier = 
      difficulty === 'easy' ? 1 :
      difficulty === 'medium' ? 2 : 3;
    
    // Base score plus time bonus
    return 10 * difficultyMultiplier + Math.round(timeLeft * difficultyMultiplier);
  };
  
  const nextRound = () => {
    if (currentRound >= maxRounds) {
      // Game over
      onGameEnd();
      return;
    }
    
    // Reset for next round
    setCurrentRound(currentRound + 1);
    setProblem(generateProblem());
    setSelectedAnswer(null);
    setFeedback(null);
    setIsAnswered(false);
    setTimeLeft(timeLimit);
  };
  
  // Format operation for display
  const formatOperation = (op: '+' | '-' | '*' | '/') => {
    switch(op) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      default: return op;
    }
  };
  
  if (!problem) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="font-medium">Round {currentRound} of {maxRounds}</div>
        <div className="px-3 py-1 bg-muted rounded-full">
          Score: {score}
        </div>
        <div className={`px-3 py-1 rounded-full ${
          timeLeft < 3 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-muted'
        }`}>
          Time: {timeLeft}s
        </div>
      </div>
      
      <div className="bg-muted/30 p-6 rounded-xl">
        <div className="flex justify-center items-center gap-3 mb-8">
          <div className="text-4xl font-bold flex items-center justify-center gap-3">
            <span>{problem.num1}</span>
            <span className="text-brain-teal">{formatOperation(problem.operation)}</span>
            <span>{problem.num2}</span>
            <span>=</span>
            <span className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-md border border-primary/30">
              ?
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {problem.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === option ? 
                feedback === 'correct' ? "outline" : "destructive" : 
                "outline"
              }
              className={`h-14 text-lg relative ${
                selectedAnswer === option && feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : ''
              } ${option === problem.answer && isAnswered && feedback === 'incorrect' ? 'border-green-500' : ''}`}
              onClick={() => handleOptionSelect(option)}
              disabled={isAnswered}
            >
              {option}
              {selectedAnswer === option && feedback === 'correct' && (
                <CheckCircle className="absolute right-2 h-5 w-5 text-green-500" />
              )}
              {selectedAnswer === option && feedback === 'incorrect' && (
                <XCircle className="absolute right-2 h-5 w-5 text-red-500" />
              )}
              {option === problem.answer && isAnswered && feedback === 'incorrect' && (
                <CheckCircle className="absolute right-2 h-5 w-5 text-green-500" />
              )}
            </Button>
          ))}
        </div>
      </div>
      
      {isAnswered && (
        <div className={`text-center font-medium ${
          feedback === 'correct' ? 'text-green-600' : 'text-red-600'
        }`}>
          {feedback === 'correct' ? 'Correct answer!' : `The correct answer was: ${problem.answer}`}
        </div>
      )}
      
      <div className="text-center text-sm text-muted-foreground">
        {difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard'} difficulty
      </div>
    </div>
  );
};

export default MentalMathGame;
