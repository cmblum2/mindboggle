
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

export interface DailyChallenge {
  id: string;
  challengeType: string;
  description: string;
  completed: boolean;
}

/**
 * Get user's cognitive stats from Supabase
 */
export const getUserStats = async (userId: string): Promise<UserStats> => {
  // Try to get data from Supabase
  try {
    const { data: performanceData, error } = await supabase
      .from('cognitive_performance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
    
    // If no data, return default stats
    if (!performanceData || performanceData.length === 0) {
      return {
        gamesPlayed: 0,
        streak: calculateStreak([]),
        overallScore: 0,
        memoryScore: 0,
        focusScore: 0,
        speedScore: 0,
        progress: 0,
        lastPlayed: null
      };
    }

    // Calculate stats from the performance data
    const latestRecord = performanceData[0];
    const gamesPlayed = performanceData.length;
    const streak = calculateStreak(performanceData);
    
    return {
      gamesPlayed,
      streak,
      overallScore: latestRecord.overall_score,
      memoryScore: latestRecord.memory_score,
      focusScore: latestRecord.focus_score,
      speedScore: latestRecord.speed_score,
      progress: calculateProgress(performanceData),
      lastPlayed: new Date(latestRecord.date)
    };
  } catch (error) {
    // Fallback to mock data if there's an error
    console.error("Error in getUserStats, using mock data:", error);
    
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
  }
};

/**
 * Save game results to Supabase
 */
export const saveGameResults = async (
  userId: string, 
  memoryScore: number, 
  focusScore: number, 
  speedScore: number
) => {
  const overallScore = Math.round((memoryScore + focusScore + speedScore) / 3);
  
  const { error } = await supabase
    .from('cognitive_performance')
    .insert({
      user_id: userId,
      memory_score: memoryScore,
      focus_score: focusScore,
      speed_score: speedScore,
      overall_score: overallScore
    });
    
  if (error) {
    console.error("Error saving game results:", error);
    throw error;
  }
  
  return { overallScore };
};

/**
 * Calculate streak based on performance data
 */
const calculateStreak = (performanceData: any[]): number => {
  if (!performanceData || performanceData.length === 0) return 0;
  
  let streak = 1;
  const today = new Date().setHours(0, 0, 0, 0);
  const oneDayMs = 86400000; // 24 hours in milliseconds
  
  // Sort by date descending
  const sortedData = [...performanceData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Check if the most recent play was today
  const mostRecentDate = new Date(sortedData[0].date).setHours(0, 0, 0, 0);
  if (mostRecentDate < today - oneDayMs) {
    return 0; // Streak broken if not played yesterday or today
  }
  
  // Count consecutive days
  for (let i = 0; i < sortedData.length - 1; i++) {
    const currentDay = new Date(sortedData[i].date).setHours(0, 0, 0, 0);
    const prevDay = new Date(sortedData[i + 1].date).setHours(0, 0, 0, 0);
    
    if (currentDay - prevDay <= oneDayMs) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Calculate progress percentage based on performance history
 */
const calculateProgress = (performanceData: any[]): number => {
  if (!performanceData || performanceData.length < 2) return 0;
  
  // Sort by date ascending
  const sortedData = [...performanceData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const firstScore = sortedData[0].overall_score;
  const latestScore = sortedData[sortedData.length - 1].overall_score;
  
  // Calculate improvement percentage (capped at 100%)
  const improvement = latestScore - firstScore;
  return Math.min(Math.max(Math.round((improvement / firstScore) * 100), 0), 100);
};

/**
 * Get AI-based game recommendations based on user stats
 */
export const getRecommendedGames = async (stats: UserStats) => {
  // Create personalized recommendations based on cognitive scores
  try {
    // Determine weakest and strongest areas
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
    
    // Calculate game difficulty based on overall score
    const recommendedDifficulty = stats.overallScore < 300 ? 'Easy' : 
                                stats.overallScore < 600 ? 'Medium' : 'Hard';
    
    // Generate personalized recommendations
    return [
      {
        id: `${weakestArea}-training`,
        name: weakestArea === 'memory' ? 'Memory Mastery' : 
              weakestArea === 'focus' ? 'Focus Trainer' : 'Speed Challenge',
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
  } catch (error) {
    console.error("Error generating recommendations:", error);
    // Fallback to default recommendations
    return [
      {
        id: 'memory-game',
        name: 'Memory Match',
        category: 'memory',
        icon: 'memory'
      },
      {
        id: 'daily-challenge',
        name: 'Daily Brain Challenge',
        category: 'mixed',
        icon: 'brain'
      }
    ];
  }
};

/**
 * Get or create daily challenges for the user
 */
export const getDailyChallenges = async (userId: string): Promise<DailyChallenge[]> => {
  try {
    // Check if user has challenges for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingChallenges, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('user_id', userId)
      .gte('date', today.toISOString())
      .order('date', { ascending: false });
      
    if (error) {
      console.error("Error fetching daily challenges:", error);
      throw error;
    }
    
    // If challenges exist for today, return them
    if (existingChallenges && existingChallenges.length > 0) {
      return existingChallenges.map(challenge => ({
        id: challenge.id,
        challengeType: challenge.challenge_type,
        description: challenge.description,
        completed: challenge.completed
      }));
    }
    
    // Get user stats to generate personalized challenges
    const userStats = await getUserStats(userId);
    
    // Generate new challenges based on user's weakest areas
    const challenges = generatePersonalizedChallenges(userStats);
    
    // Insert new challenges into database
    for (const challenge of challenges) {
      const { error: insertError } = await supabase
        .from('daily_challenges')
        .insert({
          user_id: userId,
          challenge_type: challenge.challengeType,
          description: challenge.description,
          completed: false
        });
        
      if (insertError) {
        console.error("Error inserting daily challenge:", insertError);
      }
    }
    
    // Fetch the newly created challenges
    const { data: newChallenges, error: fetchError } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('user_id', userId)
      .gte('date', today.toISOString());
      
    if (fetchError) {
      console.error("Error fetching new daily challenges:", fetchError);
      throw fetchError;
    }
    
    return (newChallenges || []).map(challenge => ({
      id: challenge.id,
      challengeType: challenge.challenge_type,
      description: challenge.description,
      completed: challenge.completed
    }));
  } catch (error) {
    console.error("Error in getDailyChallenges:", error);
    // Return mock challenges as fallback
    return [
      {
        id: '1',
        challengeType: 'memory',
        description: 'Complete a memory game with at least 80% accuracy',
        completed: false
      },
      {
        id: '2',
        challengeType: 'focus',
        description: 'Finish a focus exercise without any distractions',
        completed: false
      },
      {
        id: '3',
        challengeType: 'speed',
        description: 'Beat your previous reaction time score',
        completed: false
      }
    ];
  }
};

/**
 * Update challenge completion status
 */
export const updateChallengeStatus = async (challengeId: string, completed: boolean) => {
  const { error } = await supabase
    .from('daily_challenges')
    .update({ completed })
    .eq('id', challengeId);
    
  if (error) {
    console.error("Error updating challenge status:", error);
    throw error;
  }
};

/**
 * Generate personalized challenges based on user stats
 */
const generatePersonalizedChallenges = (stats: UserStats): DailyChallenge[] => {
  const challenges: DailyChallenge[] = [];
  
  // Determine weakest area for targeted challenge
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
  
  // Add challenge for weakest area
  challenges.push({
    id: 'temp-1',
    challengeType: weakestArea,
    description: weakestArea === 'memory' 
      ? 'Complete a memory matching game with at least 85% accuracy' 
      : weakestArea === 'focus'
      ? 'Finish a full 5-minute focus exercise without interruption'
      : 'Improve your reaction time score by at least 5%',
    completed: false
  });
  
  // Add general challenge
  challenges.push({
    id: 'temp-2',
    challengeType: 'mixed',
    description: stats.streak > 0 
      ? `Keep your ${stats.streak}-day streak going! Complete any brain exercise`
      : 'Start a streak by completing any brain exercise today',
    completed: false
  });
  
  // Add stretch goal challenge
  challenges.push({
    id: 'temp-3',
    challengeType: 'achievement',
    description: stats.gamesPlayed < 10
      ? 'Complete 3 different brain exercises today'
      : 'Beat your personal best score in any game',
    completed: false
  });
  
  return challenges;
};
