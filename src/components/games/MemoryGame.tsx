
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

  // Initialize the game
  useEffect(() => {
    initGame();
  }, [difficulty]);

  const initGame = () => {
    // Determine number of pairs based on difficulty
    let pairCount = 6; // default for easy
    if (difficulty === 'medium') pairCount = 8;
    if (difficulty === 'hard') pairCount = 12;

    // All possible symbols
    const symbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🥝', '🍍', '🥭', '🍑', '🥥'];
    
    // Select symbols based on difficulty
    const selectedSymbols = symbols.slice(0, pairCount);
    
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
  };

  // Handle card click
  const handleCardClick = (cardId: number) => {
    // Prevent clicking if two cards are already flipped and not yet processed
    if (flippedCards.length === 2) return;
    
    // Prevent clicking on already matched or already flipped cards
    const clickedCard = cards.find(card => card.id === cardId);
    if (!clickedCard || clickedCard.matched || clickedCard.flipped) return;

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
          setMatches(prevMatches => prevMatches + 1);
          
          // Update score - give more points for fewer moves
          const newScore = score + 10;
          setScore(newScore);
          onScoreChange(newScore);
          
          // Check if game is complete
          if (matches + 1 === pairCount) {
            // All pairs found
            setTimeout(() => {
              onGameEnd();
            }, 1000);
          }
        }, 500);
      } else {
        // No match, flip cards back after a delay
        setTimeout(() => {
          const resetCards = updatedCards.map(card =>
            (card.id === firstId || card.id === secondId) && !card.matched
              ? { ...card, flipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="memory-game">
      <div className="flex justify-between mb-4">
        <div className="font-medium">Moves: {moves}</div>
        <div className="font-medium">Score: {score}</div>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <Card 
            key={card.id}
            className={`aspect-square flex items-center justify-center text-3xl cursor-pointer transition-all duration-300 ${
              card.flipped ? 'bg-white' : 'bg-gray-100'
            } ${card.matched ? 'opacity-70' : 'hover:bg-gray-200'}`}
            onClick={() => handleCardClick(card.id)}
          >
            {card.flipped || card.matched ? card.symbol : ''}
          </Card>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Button onClick={initGame} variant="outline" size="sm">
          Restart Game
        </Button>
      </div>
    </div>
  );
};

export default MemoryGame;
