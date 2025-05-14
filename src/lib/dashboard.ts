
import { supabase } from "@/integrations/supabase/client";

export interface UserStats {
  gamesPlayed: number;
  streak: number;
  overallScore: number;
  memoryScore: number;
  focusScore: number;
  speedScore: number;
  progress: number;
  lastPlayed: Date | null;
}

export const getUserStats = async (userId: string): Promise<UserStats> => {
  // In a real app, this would fetch from Supabase
  // For now, we'll return mock data with some randomization
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    gamesPlayed: Math.floor(Math.random() * 10) + 5,
    streak: Math.floor(Math.random() * 5) + 1,
    overallScore: Math.floor(Math.random() * 500) + 200,
    memoryScore: Math.floor(Math.random() * 100),
    focusScore: Math.floor(Math.random() * 100),
    speedScore: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    lastPlayed: new Date(Date.now() - Math.floor(Math.random() * 86400000))
  };
};

export const getRecommendations = async (stats: UserStats) => {
  // In a real app, this would use an algorithm based on user performance
  // For now, we'll provide recommendations based on the lowest score

  let lowestCategory = 'memory';
  let lowestScore = stats.memoryScore;

  if (stats.focusScore < lowestScore) {
    lowestCategory = 'focus';
    lowestScore = stats.focusScore;
  }
  
  if (stats.speedScore < lowestScore) {
    lowestCategory = 'speed';
    lowestScore = stats.speedScore;
  }
  
  const recommendations = [
    {
      category: lowestCategory,
      gameId: lowestCategory === 'memory' ? 'memory-match' : 
              lowestCategory === 'focus' ? 'number-sequence' : 'reaction-test',
      gameName: lowestCategory === 'memory' ? 'Memory Match' : 
               lowestCategory === 'focus' ? 'Number Sequence' : 'Reaction Test',
      reason: `Your ${lowestCategory} score could use improvement`
    },
    {
      category: 'streak',
      gameId: 'word-recall',
      gameName: 'Word Recall',
      reason: 'New game to try'
    }
  ];
  
  return recommendations;
};
