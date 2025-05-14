
// This file provides a correctly exported Game type to fix build errors
import { GameCard } from "@/components/GameCard";

// Re-export the GameCard as Game for backward compatibility
export const Game = GameCard;

export default Game;
