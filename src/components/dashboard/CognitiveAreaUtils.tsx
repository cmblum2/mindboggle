
import React from 'react';
import { Brain, Check, GamepadIcon } from 'lucide-react';
import { UserStats } from '@/lib/dashboard';

export const getWeakestArea = (stats: UserStats): string => {
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
  
  return weakestArea;
};

export const getStrongestArea = (stats: UserStats): string => {
  let strongestArea = 'memory';
  let strongestScore = stats.memoryScore;
  
  if (stats.focusScore > strongestScore) {
    strongestArea = 'focus';
    strongestScore = stats.focusScore;
  }
  
  if (stats.speedScore > strongestScore) {
    strongestArea = 'speed';
    strongestScore = stats.speedScore;
  }
  
  return strongestArea;
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'memory':
      return <Brain className="h-5 w-5 text-brain-purple" />;
    case 'focus':
      return <Check className="h-5 w-5 text-brain-teal" />;
    case 'speed':
      return <GamepadIcon className="h-5 w-5 text-brain-coral" />;
    default:
      return <Brain className="h-5 w-5 text-brain-purple" />;
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'memory':
      return 'bg-brain-purple/10 dark:bg-brain-purple/20';
    case 'focus':
      return 'bg-brain-teal/10 dark:bg-brain-teal/20';
    case 'speed':
      return 'bg-brain-coral/10 dark:bg-brain-coral/20';
    default:
      return 'bg-brain-purple/10 dark:bg-brain-purple/20';
  }
};
