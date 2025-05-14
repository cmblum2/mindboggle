
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WordGameProps {
  onScoreChange: (newScore: number) => void;
  onGameEnd: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const WordGame = ({ onScoreChange, onGameEnd, difficulty = 'easy' }: WordGameProps) => {
  const [words, setWords] = useState<string[]>([]);
  const [showingWords, setShowingWords] = useState(true);
  const [userGuesses, setUserGuesses] = useState<string[]>([]);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10); // Time to memorize words

  // Word banks by difficulty
  const easyWords = ['APPLE', 'BEACH', 'CLOUD', 'DANCE', 'EAGLE', 'FLAME', 'GRAPE', 'HOUSE', 'IGLOO', 'JUICE'];
  const mediumWords = ['AUTUMN', 'BREEZE', 'CHERRY', 'DESIGN', 'FOREST', 'GUITAR', 'HARBOR', 'INSECT', 'JUNGLE', 'KANGAROO'];
  const hardWords = ['ATMOSPHERE', 'BRILLIANT', 'CHARACTER', 'DIMENSION', 'ELABORATE', 'FREQUENCY', 'GRATITUDE', 'HURRICANE', 'ILLUMINATE', 'MECHANISM'];

  // Initialize the game
  useEffect(() => {
    startNewRound();
  }, [difficulty]);

  // Timer for memorization phase
  useEffect(() => {
    let timer: number;
    
    if (showingWords && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (showingWords && timeLeft === 0) {
      setShowingWords(false);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showingWords, timeLeft]);

  const startNewRound = () => {
    // Select word bank based on difficulty
    const wordBank = difficulty === 'easy' ? easyWords 
                  : difficulty === 'medium' ? mediumWords 
                  : hardWords;
    
    // Determine number of words based on difficulty and round
    const baseCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
    const wordCount = Math.min(baseCount + Math.floor(round / 2), wordBank.length);
    
    // Select random words
    const randomWords = [...wordBank]
      .sort(() => Math.random() - 0.5)
      .slice(0, wordCount);
    
    setWords(randomWords);
    
    // Create options for recall phase (include all correct words plus some distractors)
    const distractorCount = Math.min(wordCount + 2, wordBank.length - wordCount);
    const distractors = wordBank
      .filter(word => !randomWords.includes(word))
      .sort(() => Math.random() - 0.5)
      .slice(0, distractorCount);
    
    setWordOptions([...randomWords, ...distractors].sort(() => Math.random() - 0.5));
    
    setUserGuesses([]);
    setShowingWords(true);
    setTimeLeft(difficulty === 'easy' ? 10 : difficulty === 'medium' ? 8 : 6);
  };

  const handleWordSelect = (word: string) => {
    if (showingWords) return;
    
    // Check if word is already selected
    if (userGuesses.includes(word)) {
      // Remove the word
      setUserGuesses(prev => prev.filter(w => w !== word));
      return;
    }
    
    setUserGuesses(prev => [...prev, word]);
  };

  const handleSubmit = () => {
    if (showingWords) return;

    // Calculate score
    let correctCount = 0;
    let incorrectCount = 0;
    
    // Count correct guesses
    userGuesses.forEach(guess => {
      if (words.includes(guess)) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });
    
    // Count missed words
    const missedCount = words.length - userGuesses.filter(guess => words.includes(guess)).length;
    
    // Calculate round score
    const roundScore = (correctCount * 10) - (incorrectCount * 5 + missedCount * 3);
    const newTotalScore = score + Math.max(0, roundScore);
    
    setScore(newTotalScore);
    onScoreChange(newTotalScore);
    
    // Check if game should end
    if (round >= 5) {
      setTimeout(() => {
        onGameEnd();
      }, 1500);
    } else {
      // Continue to next round
      setRound(prev => prev + 1);
      setTimeout(startNewRound, 1500);
    }
  };

  return (
    <div className="word-game">
      <div className="flex justify-between mb-4">
        <div className="font-medium">Round: {round}/5</div>
        <div className="font-medium">Score: {score}</div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {showingWords ? (
            <div>
              <div className="text-lg font-medium mb-2">Memorize these words:</div>
              <div className="mb-2 text-center">Time left: {timeLeft}s</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {words.map((word, index) => (
                  <div key={index} className="bg-primary/10 p-3 rounded-md text-center font-medium">
                    {word}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-medium mb-4 text-center">
                Select the words you remember:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {wordOptions.map((word, index) => (
                  <Button
                    key={index}
                    variant={userGuesses.includes(word) ? "default" : "outline"}
                    onClick={() => handleWordSelect(word)}
                    className="h-auto py-2"
                  >
                    {word}
                  </Button>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button onClick={handleSubmit}>
                  Submit Answers
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WordGame;
