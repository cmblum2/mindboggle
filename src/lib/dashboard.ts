
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
      .order('date', { ascending: false });

    if (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
    
    // If no data, return default stats
    if (!performanceData || performanceData.length === 0) {
      return {
        gamesPlayed: 0,
        streak: 0,
        overallScore: 0,
        memoryScore: 0,
        focusScore: 0,
        speedScore: 0,
        progress: 0,
        lastPlayed: null
      };
    }

    // Calculate all-time stats using averages and totals
    // Ensure we're getting an accurate count of total games played
    const gamesPlayed = performanceData.length;
    const streak = calculateStreak(performanceData);
    const latestRecord = performanceData[0]; // For last played date
    
    // Calculate aggregate scores using all valid game data
    let totalMemoryScore = 0;
    let totalFocusScore = 0;
    let totalSpeedScore = 0;
    let totalOverallScore = 0;
    let validRecords = 0;
    
    performanceData.forEach(record => {
      // Check if the record has valid scores
      if (record.memory_score != null && 
          record.focus_score != null && 
          record.speed_score != null &&
          record.overall_score != null) {
        totalMemoryScore += record.memory_score;
        totalFocusScore += record.focus_score;
        totalSpeedScore += record.speed_score;
        totalOverallScore += record.overall_score;
        validRecords++;
      }
    });
    
    // Calculate all-time averages, ensuring we don't divide by zero
    const memoryScore = validRecords > 0 ? Math.round(totalMemoryScore / validRecords) : 0;
    const focusScore = validRecords > 0 ? Math.round(totalFocusScore / validRecords) : 0;
    const speedScore = validRecords > 0 ? Math.round(totalSpeedScore / validRecords) : 0;
    const overallScore = validRecords > 0 ? Math.round(totalOverallScore / validRecords) : 0;
    
    return {
      gamesPlayed,
      streak,
      overallScore,
      memoryScore,
      focusScore,
      speedScore,
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
  
  // Sort by date descending (latest first)
  const sortedData = [...performanceData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneDayMs = 86400000; // 24 hours in milliseconds
  
  // Check if the most recent play was today or yesterday (to maintain streak)
  const mostRecentDate = new Date(sortedData[0].date);
  mostRecentDate.setHours(0, 0, 0, 0);
  
  // If most recent game is older than yesterday, streak is broken
  if (mostRecentDate.getTime() < today.getTime() - oneDayMs) {
    return 0;
  }
  
  // Get all days with activity
  const activeDays = new Set<string>();
  
  // Add all play days to the set (normalized to midnight)
  sortedData.forEach(data => {
    const playDate = new Date(data.date);
    playDate.setHours(0, 0, 0, 0);
    activeDays.add(playDate.toISOString().split('T')[0]);
  });
  
  // Count consecutive days
  let streak = 1; // Start with 1 for the most recent day
  let currentDate = new Date(mostRecentDate);
  
  // Work backward from the most recent day
  while (streak < activeDays.size) {
    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1);
    const dayKey = currentDate.toISOString().split('T')[0];
    
    // If there was activity on this day, increase streak
    if (activeDays.has(dayKey)) {
      streak++;
    } else {
      // Break at the first day without activity
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
  
  // For all-time progress, we'll compare the average of first 3 games
  // to the average of last 3 games (or fewer if not enough games)
  
  // Sort by date ascending
  const sortedData = [...performanceData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Get first games (up to 3)
  const firstGamesCount = Math.min(3, Math.floor(sortedData.length / 3));
  const firstGames = sortedData.slice(0, firstGamesCount);
  
  // Get last games (up to 3)
  const lastGamesCount = Math.min(3, Math.floor(sortedData.length / 3));
  const lastGames = sortedData.slice(-lastGamesCount);
  
  // Calculate averages
  const firstAverage = firstGames.reduce((sum, game) => sum + game.overall_score, 0) / firstGamesCount;
  const lastAverage = lastGames.reduce((sum, game) => sum + game.overall_score, 0) / lastGamesCount;
  
  // Calculate improvement percentage (capped at 100%)
  const improvement = lastAverage - firstAverage;
  return Math.min(Math.max(Math.round((improvement / Math.max(firstAverage, 1)) * 100), 0), 100);
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
    
    // Map the weakest area to specific game recommendations that match the valid game IDs in GameDetail
    let recommendedGameId = 'memory-match';
    let recommendedGameName = 'Memory Match';
    
    if (weakestArea === 'memory') {
      recommendedGameId = 'memory-match';
      recommendedGameName = 'Memory Match';
    } else if (weakestArea === 'focus') {
      recommendedGameId = 'number-sequence';
      recommendedGameName = 'Number Sequence';
    } else if (weakestArea === 'speed') {
      recommendedGameId = 'reaction-test';
      recommendedGameName = 'Reaction Test';
    }
    
    // Generate personalized recommendations with valid game IDs
    return [
      {
        id: recommendedGameId,
        name: recommendedGameName,
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
    // Fallback to default recommendations with valid game IDs
    return [
      {
        id: 'memory-match',
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
