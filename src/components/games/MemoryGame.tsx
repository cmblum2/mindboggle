
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Award, Clock, RotateCw, BrainCircuit } from 'lucide-react';
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
  
  const confettiRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);

  // Define emojis categorized by themes for more coherent game experience
  const emojiThemes = {
    fruits: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🥝', '🍍', '🥭', '🍑', '🥥'],
    animals: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐮', '🐸', '🐵'],
    space: ['🚀', '🛸', '🌍', '🌙', '⭐', '☄️', '🪐', '🌠', '👽', '🌌', '🔭', '👨‍🚀'],
    emotions: ['😀', '😍', '😎', '🤔', '😮', '🥳', '😴', '😂', '🤩', '😇', '🤗', '🤯']
  };

  // Initialize the game
  useEffect(() => {
    initGame();
  }, [difficulty]);

  const initGame = () => {
    // Determine number of pairs based on difficulty
    let newPairCount = 6; // default for easy
    if (difficulty === 'medium') newPairCount = 8;
    if (difficulty === 'hard') newPairCount = 12;
    
    setPairCount(newPairCount);

    // Choose a random theme
    const themes = Object.keys(emojiThemes) as Array<keyof typeof emojiThemes>;
    const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
    const symbols = emojiThemes[selectedTheme];
    
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
  };

  const startGame = () => {
    setGameStarted(true);
    
    // Show a quick peek at all cards at the beginning
    setShowPeek(true);
    setTimeout(() => {
      setShowPeek(false);
    }, difficulty === 'easy' ? 2000 : difficulty === 'medium' ? 1500 : 1000);
  };

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (!gameStarted) return;
    
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
          
          // Update score - more points for combo and fewer moves
          const matchPoints = 10;
          const bonusForFewMoves = Math.max(0, 5 - Math.floor(moves / 3));
          const comboBonus = (newMultiplier > 1) ? newMultiplier * 5 : 0;
          const pointsGained = matchPoints + bonusForFewMoves + comboBonus;
          
          const newScore = score + pointsGained;
          setScore(newScore);
          onScoreChange(newScore);
          
          // Check if game is complete
          if (newMatches === pairCount) {
            // All pairs found - celebrate!
            triggerConfetti();
            playSound('victory');
            
            // End game after celebration
            setTimeout(() => {
              onGameEnd();
            }, 2000);
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
  const playSound = (type: 'flip' | 'match' | 'nomatch' | 'victory' | 'combo') => {
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
        particleCount: 100,
        spread: 70,
        origin: { 
          x: x / window.innerWidth, 
          y: y / window.innerHeight 
        }
      });
    }
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
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white"
              size="lg"
            >
              Start Game
            </Button>
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
                  >
                    <Card 
                      className={cn(
                        "aspect-square cursor-pointer relative preserve-3d transform transition-all duration-300",
                        card.matched ? "opacity-70" : "",
                        !card.flipped && !card.matched && !showPeek ? "hover:shadow-md hover:bg-gray-100" : ""
                      )}
                    >
                      {/* Back of card */}
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center backface-hidden bg-gradient-to-br from-brain-purple/80 to-brain-teal/80 rounded-lg",
                        "text-white"
                      )}>
                        <span className="text-xl">?</span>
                      </div>
                      
                      {/* Front of card */}
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center backface-hidden bg-white rounded-lg transform rotateY-180",
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
            
            <div className="mt-4 text-center">
              <Button onClick={initGame} variant="outline" size="sm" className="flex items-center">
                <RotateCw className="w-4 h-4 mr-1" /> Restart Game
              </Button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotateY-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default MemoryGame;
