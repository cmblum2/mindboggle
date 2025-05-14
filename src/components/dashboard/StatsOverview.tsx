
import React from 'react';
import { GamepadIcon, TrendingUp, Award, Calendar } from 'lucide-react';
import StatCard from './StatCard';
import { UserStats } from '@/lib/dashboard';

interface StatsOverviewProps {
  stats: UserStats;
  isLoading: boolean;
}

const StatsOverview = ({ stats, isLoading }: StatsOverviewProps) => {
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleDateString();
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-8">
      <StatCard 
        title="Total Games" 
        value={stats.gamesPlayed.toString()} 
        icon={<GamepadIcon className="h-8 w-8 mb-2 text-brain-purple" />}
        isLoading={isLoading}
      />
      
      <StatCard 
        title="Day Streak" 
        value={stats.streak.toString()} 
        icon={<TrendingUp className="h-8 w-8 mb-2 text-brain-teal" />}
        isLoading={isLoading}
      />
      
      <StatCard 
        title="Avg Score" 
        value={stats.overallScore.toString()} 
        icon={<Award className="h-8 w-8 mb-2 text-brain-coral" />}
        isLoading={isLoading}
      />
      
      <StatCard 
        title="Last Played" 
        value={formatDate(stats.lastPlayed)} 
        icon={<Calendar className="h-8 w-8 mb-2 text-brain-purple" />}
        isLoading={isLoading}
      />
    </div>
  );
};

export default StatsOverview;
