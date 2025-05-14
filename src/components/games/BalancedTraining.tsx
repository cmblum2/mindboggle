
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  const [userAnswer, setUserAnswer] = useState<string | number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

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
    const sequenceLength = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 9;
    
    for (let i = 0; i < sequenceLength; i++) {
      const gameTypeIndex = getRandomNumber(0, 2, dailySeed + i);
      const gameType = ['memory', 'focus', 'speed'][gameTypeIndex] as 'memory' | 'focus' | 'speed';
      gameSequence.push(gameType);
    }
    
    // Initialize with the first game
    setCurrentGame(gameSequence[0]);
    generateGameData(gameSequence[0], dailySeed);
  }, [difficulty]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showFeedback) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      handleAnswer(null); // Time's up
    }
  }, [timeLeft, showFeedback]);

  // Generate game data based on the current game type
  const generateGameData = (gameType: 'memory' | 'focus' | 'speed', seed: number) => {
    const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    
    switch (gameType) {
      case 'memory':
        // Generate a sequence of numbers to remember
        const sequenceLength = 3 + difficultyMultiplier;
        const sequence = [];
        for (let i = 0; i < sequenceLength; i++) {
          sequence.push(getRandomNumber(1, 9, seed + i * 100));
        }
        setGameData({ sequence, displayMode: true });
        // Hide sequence after a few seconds
        setTimeout(() => setGameData({ sequence, displayMode: false }), 3000);
        break;
        
      case 'focus':
        // Generate a pattern matching puzzle
        const gridSize = 3 + difficultyMultiplier;
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
        setGameData({ grid, target, answer: targetsCount });
        break;
        
      case 'speed':
        // Generate a quick math problem
        const operations = ['+', '-', '*'];
        const operation = operations[getRandomNumber(0, 2, seed)];
        const num1 = getRandomNumber(1, 10 * difficultyMultiplier, seed + 1);
        const num2 = getRandomNumber(1, 10, seed + 2);
        
        let answer;
        switch (operation) {
          case '+': answer = num1 + num2; break;
          case '-': answer = num1 - num2; break;
          case '*': answer = num1 * num2; break;
          default: answer = num1 + num2;
        }
        
        setGameData({ num1, num2, operation, answer });
        break;
    }
    
    // Reset for the new mini-game
    setTimeLeft(15);
    setUserAnswer(null);
    setShowFeedback(false);
  };

  // Handle user's answer
  const handleAnswer = (answer: string | number | null) => {
    setUserAnswer(answer);
    setShowFeedback(true);
    
    // Check if answer is correct
    let correct = false;
    if (currentGame === 'memory') {
      correct = gameData?.sequence?.join('') === answer;
    } else if (currentGame === 'focus') {
      correct = gameData?.answer === Number(answer);
    } else if (currentGame === 'speed') {
      correct = gameData?.answer === Number(answer);
    }
    
    setIsCorrect(correct);
    
    // Update score
    if (correct) {
      const points = 10 + (timeLeft * 2);
      setTotalScore(prev => prev + points);
      onScoreChange(totalScore + points);
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
    const sequenceLength = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 9;
    
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

  // Render the current game
  const renderGame = () => {
    if (showFeedback) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <div className={`text-3xl ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect!'}
          </div>
          <div className="text-lg">
            {isCorrect ? `+${10 + (timeLeft * 2)} points` : 'No points awarded'}
          </div>
        </div>
      );
    }
    
    switch (currentGame) {
      case 'memory':
        return (
          <div className="space-y-6 p-4 text-center">
            <div className="text-lg font-medium text-brain-purple mb-4">
              Remember this sequence
            </div>
            
            {gameData?.displayMode ? (
              <div className="text-3xl font-bold tracking-widest">
                {gameData?.sequence?.join(' ')}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-lg">Enter the sequence you saw:</div>
                <input
                  type="text"
                  className="p-2 border rounded w-full text-center text-xl"
                  onChange={(e) => setUserAnswer(e.target.value)}
                  autoFocus
                />
                <Button 
                  onClick={() => handleAnswer(userAnswer)}
                  className="w-full"
                >
                  Submit
                </Button>
              </div>
            )}
          </div>
        );
        
      case 'focus':
        return (
          <div className="space-y-6 p-4 text-center">
            <div className="text-lg font-medium text-brain-teal mb-2">
              Count how many times you see the number: <span className="text-2xl font-bold">{gameData?.target}</span>
            </div>
            
            <div className="grid gap-2" style={{ 
              gridTemplateColumns: `repeat(${gameData?.grid?.[0]?.length || 3}, 1fr)` 
            }}>
              {gameData?.grid?.flat().map((num: number, idx: number) => (
                <Card key={idx} className="aspect-square flex items-center justify-center">
                  <CardContent className="p-0 flex items-center justify-center h-full">
                    <span className="text-xl font-medium">{num}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="text-lg">How many {gameData?.target}'s did you count?</div>
              <input
                type="number"
                className="p-2 border rounded w-full text-center text-xl"
                onChange={(e) => setUserAnswer(e.target.value)}
              />
              <Button 
                onClick={() => handleAnswer(userAnswer)}
                className="w-full"
              >
                Submit
              </Button>
            </div>
          </div>
        );
        
      case 'speed':
        return (
          <div className="space-y-6 p-4 text-center">
            <div className="text-lg font-medium text-brain-coral mb-4">
              Solve this math problem quickly!
            </div>
            
            <div className="text-3xl font-bold">
              {gameData?.num1} {gameData?.operation} {gameData?.num2} = ?
            </div>
            
            <div className="space-y-4 pt-2">
              <input
                type="number"
                className="p-2 border rounded w-full text-center text-xl"
                onChange={(e) => setUserAnswer(e.target.value)}
                autoFocus
              />
              <Button 
                onClick={() => handleAnswer(userAnswer)}
                className="w-full"
              >
                Submit
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="balanced-training-container">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Brain className={`h-5 w-5 mr-2 ${
            currentGame === 'memory' ? 'text-brain-purple' : 
            currentGame === 'focus' ? 'text-brain-teal' : 
            'text-brain-coral'
          }`} />
          <span className="font-medium">{
            currentGame === 'memory' ? 'Memory' : 
            currentGame === 'focus' ? 'Focus' : 
            'Speed'
          } Task</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className={`${timeLeft < 5 ? 'text-red-500 font-bold' : ''}`}>{timeLeft}s</span>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            <span>{totalScore}</span>
          </div>
        </div>
      </div>
      
      <div className="game-content min-h-[300px] border rounded-xl p-4 flex flex-col justify-center">
        {renderGame()}
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        Game {gameIndex + 1} of {difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 9} • Daily Balanced Training
      </div>
    </div>
  );
};

export default BalancedTraining;
