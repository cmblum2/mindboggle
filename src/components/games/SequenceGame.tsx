
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

  // Initialize the game
  useEffect(() => {
    startNewLevel();
  }, [difficulty]);

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
      }, 800);

      return () => clearTimeout(sequenceTimer);
    }
  }, [showingSequence, currentStep, sequence.length]);

  // Generate a new sequence for the current level
  const generateSequence = () => {
    const baseLength = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
    const length = baseLength + Math.floor(level / 2);
    
    return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
  };

  const startNewLevel = () => {
    const newSequence = generateSequence();
    setSequence(newSequence);
    setUserSequence([]);
    setShowingSequence(true);
    setCurrentStep(0);
    setGameOver(false);
  };

  const handleNumberClick = (number: number) => {
    if (showingSequence || gameOver) return;

    const newUserSequence = [...userSequence, number];
    setUserSequence(newUserSequence);

    // Check if the user's input matches the sequence so far
    const isCorrect = newUserSequence[newUserSequence.length - 1] === sequence[newUserSequence.length - 1];

    if (!isCorrect) {
      // Wrong number - game over
      setGameOver(true);
      const finalScore = score;
      onScoreChange(finalScore);
      
      setTimeout(() => {
        onGameEnd();
      }, 1500);
      
      return;
    }

    // If user completed the sequence correctly
    if (newUserSequence.length === sequence.length) {
      // Level completed successfully
      const levelPoints = sequence.length * 5;
      const newScore = score + levelPoints;
      
      setScore(newScore);
      onScoreChange(newScore);
      setLevel(prevLevel => prevLevel + 1);
      
      // Short pause before next level
      setTimeout(() => {
        startNewLevel();
      }, 1000);
    }
  };

  return (
    <div className="sequence-game">
      <div className="flex justify-between mb-4">
        <div className="font-medium">Level: {level}</div>
        <div className="font-medium">Score: {score}</div>
      </div>

      <Card className="p-6 mb-6 text-center">
        {showingSequence ? (
          <div className="text-3xl font-bold h-24 flex items-center justify-center">
            {currentStep < sequence.length ? sequence[currentStep] : ''}
          </div>
        ) : gameOver ? (
          <div className="text-xl text-red-500 font-medium h-24 flex items-center justify-center">
            Wrong sequence! Game over.
          </div>
        ) : (
          <div className="text-lg h-24 flex items-center justify-center">
            {userSequence.length === 0 ? 
              "Repeat the sequence" : 
              `${userSequence.length}/${sequence.length}`
            }
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
          <Button
            key={number}
            onClick={() => handleNumberClick(number)}
            disabled={showingSequence || gameOver}
            className="h-16 text-xl"
          >
            {number}
          </Button>
        ))}
      </div>
      
      {gameOver && (
        <div className="mt-4 text-center">
          <Button onClick={startNewLevel} variant="default">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default SequenceGame;
