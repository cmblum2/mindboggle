
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
  // In a real implementation, this would fetch from Supabase
  // For now, we'll simulate an API call with realistic data
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return realistic but randomized mock data
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

export const getRecommendedGames = async (stats: UserStats) => {
  // In a real implementation, this would use an algorithm based on user performance
  // For now, we'll generate recommendations based on the lowest cognitive score
  
  let weakestArea = 'memory';
  let weakestScore = stats.memoryScore;
  
  if (stats.focusScore < weakestScore) {
    weakestArea = 'focus';
    weakestScore = stats.focusScore;
  }
  
  if (stats.speedScore < weakestScore) {
    weakestArea = 'speed';
    weakestScore = stats.speedScore;
  }
  
  return [
    {
      id: `${weakestArea}-game`,
      name: weakestArea === 'memory' ? 'Memory Match' : 
            weakestArea === 'focus' ? 'Focus Challenge' : 'Reaction Time',
      category: weakestArea,
      icon: weakestArea
    },
    {
      id: 'daily-challenge',
      name: 'Daily Brain Challenge',
      category: 'mixed',
      icon: 'brain'
    }
  ];
};
