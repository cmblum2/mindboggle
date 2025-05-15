
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Award, Clock, RotateCw, BrainCircuit, Trophy, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface MemoryCard {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

interface MemoryGameProps {
  onScoreChange: (newScore: number) => void;
  onGameEnd: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const MemoryGame = ({ onScoreChange, onGameEnd, difficulty = 'easy' }: MemoryGameProps) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [pairCount, setPairCount] = useState(6);
  const [gameStarted, setGameStarted] = useState(false);
  const [showPeek, setShowPeek] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showCombo, setShowCombo] = useState(false);
  const [lastMatchTime, setLastMatchTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('');
  
  const confettiRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  // Define emojis categorized by themes for more coherent game experience
  const emojiThemes = {
    fruits: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🥝', '🍍', '🥭', '🍑', '🥥'],
    animals: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐮', '🐸', '🐵'],
    space: ['🚀', '🛸', '🌍', '🌙', '⭐', '☄️', '🪐', '🌠', '👽', '🌌', '🔭', '👨‍🚀'],
    emotions: ['😀', '😍', '😎', '🤔', '😮', '🥳', '😴', '😂', '🤩', '😇', '🤗', '🤯'],
    sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '⛳', '🏊‍♀️'],
    food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍩', '🍦', '🍫', '🍪', '🥞', '🥪']
  };

  const themeBgClasses = {
    fruits: 'from-red-500 to-orange-500',
    animals: 'from-yellow-500 to-amber-500',
    space: 'from-indigo-500 to-purple-500',
    emotions: 'from-yellow-500 to-pink-500',
    sports: 'from-emerald-500 to-cyan-500',
    food: 'from-orange-500 to-red-500'
  };

  const getThemeClass = (theme: string) => {
    return themeBgClasses[theme as keyof typeof themeBgClasses] || 'from-brain-purple to-brain-teal';
  };

  // Initialize the game
  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [difficulty]);

  const initGame = () => {
    // Determine number of pairs based on difficulty and level
    let newPairCount = 6; // default for easy
    if (difficulty === 'medium') newPairCount = 8;
    if (difficulty === 'hard') newPairCount = 12;
    
    // Increase pair count slightly based on level (max +4 pairs)
    const levelBonus = Math.min(level - 1, 4);
    newPairCount = Math.min(newPairCount + levelBonus, 12);
    
    setPairCount(newPairCount);

    // Choose a random theme
    const themes = Object.keys(emojiThemes);
    const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
    setCurrentTheme(selectedTheme);
    const symbols = emojiThemes[selectedTheme as keyof typeof emojiThemes];
    
    // Select symbols based on difficulty
    const selectedSymbols = symbols.slice(0, newPairCount);
    
    // Create pairs and shuffle
    const cardPairs = [...selectedSymbols, ...selectedSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        flipped: false,
        matched: false
      }));

    setCards(cardPairs);
    setFlippedCards([]);
    setMatches(0);
    setScore(0);
    setMoves(0);
    setComboMultiplier(1);
    setGameStarted(false);
    setShowPeek(false);
    setIsGameOver(false);
    setShowHint(false);
    
    // Set time based on difficulty and level
    let gameTime = difficulty === 'easy' ? 90 : difficulty === 'medium' ? 75 : 60;
    // Reduce time slightly for higher levels
    gameTime = Math.max(gameTime - (level - 1) * 5, 30);
    setTimeLeft(gameTime);
  };

  const startGame = () => {
    setGameStarted(true);
    
    // Show a quick peek at all cards at the beginning
    setShowPeek(true);
    setTimeout(() => {
      setShowPeek(false);
    }, difficulty === 'easy' ? 2000 : difficulty === 'medium' ? 1500 : 1000);
    
    // Start the timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current as number);
          if (!isGameOver) {
            handleGameOver();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    playSound('gameover');
    // End the game after a short delay
    setTimeout(() => {
      onGameEnd();
    }, 2000);
  };

  const useHint = () => {
    if (cards.filter(c => !c.matched).length <= 2) return; // Don't allow hints when almost finished
    
    setShowHint(true);
    // Deduct points for using a hint
    const newScore = Math.max(0, score - 10);
    setScore(newScore);
    onScoreChange(newScore);
    
    // Create a temporary reveal of all cards
    const updatedCards = cards.map(card => ({ ...card, flipped: true }));
    setCards(updatedCards);
    
    // Hide cards again after a short peek
    setTimeout(() => {
      const resetCards = updatedCards.map(card => 
        !card.matched ? { ...card, flipped: false } : card
      );
      setCards(resetCards);
      setShowHint(false);
    }, 1000);
  };

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (!gameStarted || isGameOver) return;
    
    // Prevent clicking if two cards are already flipped and not yet processed
    if (flippedCards.length === 2 || animatingRef.current) return;
    
    // Prevent clicking on already matched or already flipped cards
    const clickedCard = cards.find(card => card.id === cardId);
    if (!clickedCard || clickedCard.matched || clickedCard.flipped) return;

    // Play card flip sound
    playSound('flip');

    // Flip the card
    const updatedCards = cards.map(card =>
      card.id === cardId ? { ...card, flipped: true } : card
    );
    setCards(updatedCards);
    
    // Add to flipped cards
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      animatingRef.current = true;
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = updatedCards.find(card => card.id === firstId);
      const secondCard = updatedCards.find(card => card.id === secondId);
      
      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          const matchedCards = updatedCards.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, matched: true }
              : card
          );
          setCards(matchedCards);
          setFlippedCards([]);
          const newMatches = matches + 1;
          setMatches(newMatches);
          
          // Check if combo (match found within 2 seconds of previous match)
          const now = Date.now();
          const timeSinceLastMatch = now - lastMatchTime;
          setLastMatchTime(now);
          
          // Update combo multiplier if match was found quickly
          let newMultiplier = comboMultiplier;
          if (lastMatchTime > 0 && timeSinceLastMatch < 2000) {
            newMultiplier = Math.min(comboMultiplier + 1, 5);
            setComboMultiplier(newMultiplier);
            setShowCombo(true);
            setTimeout(() => setShowCombo(false), 1500);
            
            // Play combo sound
            playSound('combo');
          } else {
            setComboMultiplier(1);
            
            // Play match sound
            playSound('match');
          }
          
          // Update score - more points for combo and fewer moves and remaining time
          const matchPoints = 10;
          const bonusForFewMoves = Math.max(0, 5 - Math.floor(moves / 3));
          const comboBonus = (newMultiplier > 1) ? newMultiplier * 5 : 0;
          const timeBonus = Math.floor(timeLeft / 10);
          const pointsGained = matchPoints + bonusForFewMoves + comboBonus + timeBonus;
          
          const newScore = score + pointsGained;
          setScore(newScore);
          onScoreChange(newScore);
          
          // Check if game is complete
          if (newMatches === pairCount) {
            // All pairs found - celebrate!
            triggerConfetti();
            playSound('victory');
            
            // Clear timer
            if (timerRef.current) clearInterval(timerRef.current);
            
            // Show level completion message
            setIsGameOver(true);
            
            // End game after celebration
            setTimeout(() => {
              // Progress to next level if time permits
              if (timeLeft > 5) {
                setLevel(prev => prev + 1);
                initGame();
                setTimeout(() => {
                  setGameStarted(true);
                  // Start the timer again for new level
                  timerRef.current = window.setInterval(() => {
                    setTimeLeft(prev => {
                      if (prev <= 1) {
                        clearInterval(timerRef.current as number);
                        handleGameOver();
                        return 0;
                      }
                      return prev - 1;
                    });
                  }, 1000);
                }, 2000);
              } else {
                onGameEnd();
              }
            }, 3000);
          }
          
          animatingRef.current = false;
        }, 500);
      } else {
        // No match, flip cards back after a delay
        playSound('nomatch');
        
        setTimeout(() => {
          const resetCards = updatedCards.map(card =>
            (card.id === firstId || card.id === secondId) && !card.matched
              ? { ...card, flipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
          setComboMultiplier(1);
          animatingRef.current = false;
        }, 1000);
      }
    }
  };

  // Simulate sounds (in a real app, use actual sound files)
  const playSound = (type: 'flip' | 'match' | 'nomatch' | 'victory' | 'combo' | 'gameover') => {
    // In a real implementation, this would play actual sounds
    console.log(`Playing sound: ${type}`);
  };
  
  // Confetti celebration
  const triggerConfetti = () => {
    if (confettiRef.current) {
      const rect = confettiRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { 
          x: x / window.innerWidth, 
          y: y / window.innerHeight 
        },
        colors: ['#9b87f5', '#6366f1', '#22c55e', '#ef4444', '#f97316']
      });
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Determine grid columns based on difficulty and screen size
  const getGridColumns = () => {
    if (difficulty === 'easy') return 'grid-cols-3 sm:grid-cols-4';
    if (difficulty === 'medium') return 'grid-cols-3 sm:grid-cols-4';
    return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6'; // hard difficulty
  };

  return (
    <div className="memory-game" ref={confettiRef}>
      <div className="flex flex-col space-y-6">
        {!gameStarted ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <BrainCircuit className="w-16 h-16 mx-auto text-brain-purple" />
            <h2 className="text-2xl font-bold">Memory Master</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Test your memory by matching pairs of cards. Find all matches as quickly as possible!
            </p>
            <div className="flex flex-col gap-2 items-center">
              <div className="bg-muted/70 p-3 rounded-lg mb-2">
                <div className="text-sm font-medium">Level {level}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                  <Star className="w-4 h-4 text-amber-400" fill={level >= 2 ? "currentColor" : "none"} />
                  <Star className="w-4 h-4 text-amber-400" fill={level >= 3 ? "currentColor" : "none"} />
                </div>
              </div>
              <Button 
                onClick={startGame}
                className={`bg-gradient-to-r ${getThemeClass(currentTheme)} hover:opacity-90 text-white`}
                size="lg"
              >
                Start Game
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="rounded-lg bg-muted/50 p-2">
                <div className="text-xs text-muted-foreground">Moves</div>
                <div className="flex items-center justify-center font-medium">
                  <Clock className="w-4 h-4 mr-1" /> {moves}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 relative">
                {showCombo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 0 }}
                    animate={{ opacity: 1, scale: 1, y: -30 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="absolute top-0 left-0 right-0 text-center text-amber-500 font-bold"
                  >
                    x{comboMultiplier} Combo!
                  </motion.div>
                )}
                <div className="text-xs text-muted-foreground">Score</div>
                <div className="flex items-center justify-center font-medium">
                  <Award className="w-4 h-4 mr-1" /> {score}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <div className="text-xs text-muted-foreground">Matched</div>
                <div className="flex items-center justify-center font-medium">
                  {matches}/{pairCount}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <motion.div 
                className={`px-3 py-1 rounded-md font-medium ${
                  timeLeft < 10 ? "bg-red-500 text-white" : "bg-muted"
                }`}
                animate={timeLeft < 10 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: timeLeft < 10 ? Infinity : 0, duration: 0.5 }}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                {formatTime(timeLeft)}
              </motion.div>
              
              {level > 1 && (
                <div className="px-3 py-1 rounded-md bg-muted/70 flex items-center">
                  <Trophy className="w-4 h-4 text-amber-500 mr-1" />
                  <span>Level {level}</span>
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm"
                disabled={showHint || isGameOver || cards.filter(c => !c.matched).length <= 2}
                onClick={useHint}
                className="flex items-center text-xs"
              >
                <Shield className="w-3 h-3 mr-1" /> Hint (-10 pts)
              </Button>
            </div>
            
            <div className={`grid ${getGridColumns()} gap-3`}>
              <AnimatePresence>
                {cards.map(card => (
                  <motion.div
                    key={card.id}
                    initial={{ rotateY: 0 }}
                    animate={{ 
                      rotateY: (card.flipped || card.matched || showPeek) ? 180 : 0,
                      scale: card.matched ? 0.95 : 1
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    onClick={() => handleCardClick(card.id)}
                    className={cn(
                      "cursor-pointer",
                      card.matched && "opacity-70"
                    )}
                  >
                    <Card 
                      className={cn(
                        "aspect-square relative preserve-3d transform transition-all duration-300",
                        card.matched ? "opacity-70" : "",
                        !card.flipped && !card.matched && !showPeek ? "hover:shadow-lg hover:scale-[1.02]" : ""
                      )}
                    >
                      {/* Back of card */}
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center backface-hidden rounded-lg",
                        `bg-gradient-to-br ${getThemeClass(currentTheme)}`,
                        "text-white shadow-md"
                      )}>
                        <span className="text-xl drop-shadow-sm">?</span>
                      </div>
                      
                      {/* Front of card */}
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center backface-hidden bg-white rounded-lg transform rotateY-180 shadow-md",
                        card.matched && "bg-green-50"
                      )}>
                        <span className="text-4xl">{card.symbol}</span>
                        {card.matched && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Sparkles className="text-yellow-500 w-6 h-6 absolute" />
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {isGameOver && matches === pairCount && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 backdrop-blur-sm"
              >
                <Card className="p-6 max-w-sm mx-auto text-center">
                  <Trophy className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
                  <h3 className="text-xl font-bold mb-2">Level {level} Complete!</h3>
                  <p className="text-muted-foreground mb-4">
                    Score: {score} • Matches: {matches}/{pairCount}
                  </p>
                  {timeLeft > 5 ? (
                    <p className="text-green-600 font-medium mb-4">
                      Advancing to level {level + 1}...
                    </p>
                  ) : (
                    <p className="text-amber-600 font-medium mb-4">
                      Great job! You've completed all levels.
                    </p>
                  )}
                </Card>
              </motion.div>
            )}
            
            {isGameOver && matches < pairCount && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 backdrop-blur-sm"
              >
                <Card className="p-6 max-w-sm mx-auto text-center">
                  <Clock className="w-12 h-12 mx-auto text-red-500 mb-2" />
                  <h3 className="text-xl font-bold mb-2">Time's Up!</h3>
                  <p className="text-muted-foreground mb-4">
                    Score: {score} • Matches: {matches}/{pairCount}
                  </p>
                  <p className="text-amber-600 font-medium mb-4">
                    Try again to beat your score!
                  </p>
                </Card>
              </motion.div>
            )}
            
            <div className="mt-4 text-center">
              <Button onClick={initGame} variant="outline" size="sm" className="flex items-center">
                <RotateCw className="w-4 h-4 mr-1" /> Restart Game
              </Button>
            </div>
          </>
        )}
      </div>

      <style>
        {`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotateY-180 {
          transform: rotateY(180deg);
        }
        `}
      </style>
    </div>
  );
};

export default MemoryGame;
