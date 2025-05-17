
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PatternRecognitionGameProps {
  onScoreChange: (score: number) => void;
  onGameEnd: () => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Pattern {
  sequence: number[];
  answer: number;
  options: number[];
}

const PatternRecognitionGame = ({ onScoreChange, onGameEnd, difficulty }: PatternRecognitionGameProps) => {
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [timeLimit, setTimeLimit] = useState(15); // Time limit in seconds
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);
  const maxRounds = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 10;

  // Generate a pattern based on difficulty
  const generatePattern = useCallback(() => {
    // Define pattern complexity based on difficulty
    const patternLength = difficulty === 'easy' ? 3 : 
                         difficulty === 'medium' ? 5 : 7;
    const maxNumber = difficulty === 'easy' ? 10 : 
                     difficulty === 'medium' ? 20 : 30;
    
    // Generate different pattern types
    const patternType = Math.floor(Math.random() * 4);
    let sequence: number[] = [];
    let answer: number;
    
    // Pattern types: 0 = arithmetic, 1 = geometric, 2 = fibonacci-like, 3 = alternating
    switch (patternType) {
      case 0: { // Arithmetic (adding/subtracting a constant)
        const start = Math.floor(Math.random() * maxNumber) + 1;
        const step = Math.floor(Math.random() * 5) + 1;
        sequence = Array(patternLength).fill(0).map((_, i) => start + (step * i));
        answer = start + (step * patternLength);
        break;
      }
      case 1: { // Geometric (multiplying/dividing by a constant)
        const start = Math.floor(Math.random() * 5) + 1;
        const factor = Math.floor(Math.random() * 2) + 2;
        sequence = Array(patternLength).fill(0).map((_, i) => start * Math.pow(factor, i));
        answer = start * Math.pow(factor, patternLength);
        break;
      }
      case 2: { // Fibonacci-like (each number is sum of previous two)
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 10) + a;
        sequence = [a, b];
        for (let i = 2; i < patternLength; i++) {
          sequence.push(sequence[i-1] + sequence[i-2]);
        }
        answer = sequence[patternLength-1] + sequence[patternLength-2];
        break;
      }
      default: { // Alternating pattern
        const start = Math.floor(Math.random() * maxNumber) + 1;
        const step1 = Math.floor(Math.random() * 5) + 1;
        const step2 = Math.floor(Math.random() * 5) + 1;
        sequence = [];
        for (let i = 0; i < patternLength; i++) {
          sequence.push(i % 2 === 0 ? start + (i * step1) : start + (i * step2));
        }
        answer = patternLength % 2 === 0 ? 
          start + (patternLength * step1) : 
          start + (patternLength * step2);
      }
    }
    
    // Generate options (including the correct answer)
    let options = [answer];
    
    // Add 3 incorrect but plausible options
    while (options.length < 4) {
      // Variation from correct answer
      const variation = Math.floor(Math.random() * (maxNumber / 2)) + 1;
      const sign = Math.random() > 0.5 ? 1 : -1;
      const wrongAnswer = answer + (sign * variation);
      
      // Make sure we don't add duplicates
      if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);
    
    return {
      sequence,
      answer,
      options
    };
  }, [difficulty]);

  // Initialize game
  useEffect(() => {
    setPattern(generatePattern());
    setTimeLimit(difficulty === 'easy' ? 15 : difficulty === 'medium' ? 12 : 10);
    setTimeLeft(difficulty === 'easy' ? 15 : difficulty === 'medium' ? 12 : 10);
  }, [difficulty, generatePattern]);

  // Time counter
  useEffect(() => {
    if (isAnswered || !pattern) return;
    
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
  }, [timeLeft, isAnswered, pattern]);

  const handleOptionSelect = (option: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    if (option === pattern?.answer) {
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
    return 10 * difficultyMultiplier + Math.round(timeLeft * 0.5 * difficultyMultiplier);
  };

  const nextRound = () => {
    if (currentRound >= maxRounds) {
      // Game over
      onGameEnd();
      return;
    }
    
    // Reset for next round
    setCurrentRound(currentRound + 1);
    setPattern(generatePattern());
    setSelectedAnswer(null);
    setFeedback(null);
    setIsAnswered(false);
    setTimeLeft(timeLimit);
  };

  if (!pattern) {
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
          timeLeft < 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-muted'
        }`}>
          Time: {timeLeft}s
        </div>
      </div>
      
      <div className="bg-muted/30 p-6 rounded-xl">
        <h3 className="text-lg font-medium mb-4 text-center">What comes next in this sequence?</h3>
        
        <div className="flex justify-center items-center gap-3 flex-wrap mb-6">
          {pattern.sequence.map((number, index) => (
            <div 
              key={index}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200 text-lg font-medium"
            >
              {number}
            </div>
          ))}
          <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-md border border-primary/30 text-lg font-medium">
            ?
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {pattern.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === option ? 
                feedback === 'correct' ? "outline" : "destructive" : 
                "outline"
              }
              className={`h-14 text-lg relative ${
                selectedAnswer === option && feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : ''
              } ${option === pattern.answer && isAnswered && feedback === 'incorrect' ? 'border-green-500' : ''}`}
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
              {option === pattern.answer && isAnswered && feedback === 'incorrect' && (
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
          {feedback === 'correct' ? 'Correct answer!' : `The correct answer was: ${pattern.answer}`}
        </div>
      )}
      
      <div className="text-center text-sm text-muted-foreground">
        {difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard'} difficulty
      </div>
    </div>
  );
};

export default PatternRecognitionGame;
