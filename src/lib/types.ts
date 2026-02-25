// Core data model for the cognitive training platform

export interface User {
  id: string;
  createdAt: string;
  timezone: string;
  baselineComplete: boolean;
  consentFlags: { analytics: boolean; experiments: boolean };
}

export interface Session {
  id: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  moodPre?: number; // 1-5
  sleep?: number; // hours
  stress?: number; // 1-5
}

export type CognitiveDomain = 'working_memory' | 'inhibitory_control' | 'cognitive_flexibility' | 'attention' | 'processing_speed';

export interface Game {
  id: string;
  name: string;
  domain: CognitiveDomain;
  description: string;
  version: string;
}

export interface Trial {
  id: string;
  sessionId: string;
  gameId: string;
  startedAt: string;
  endedAt: string;
  stimulus: string;
  response: string;
  correct: boolean;
  rtMs: number;
  difficulty: number;
  hintsUsed: number;
}

export type EventType =
  | 'app_open' | 'session_start' | 'session_end'
  | 'game_start' | 'game_end' | 'trial_start' | 'trial_end'
  | 'hint_used' | 'difficulty_changed' | 'rage_quit'
  | 'notification_open' | 'share_click' | 'settings_change';

export interface AppEvent {
  id: string;
  userId: string;
  sessionId?: string;
  gameId?: string;
  ts: string;
  type: EventType;
  payload: Record<string, any>;
}

export interface DailySummary {
  userId: string;
  date: string;
  minutesTrained: number;
  gamesPlayed: number;
  adherence: number; // 0-1
  compositeScore: number;
  domainScores: Record<CognitiveDomain, number>;
}

export interface Experiment {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed';
  startDate: string;
  endDate: string | null;
  variants: { id: string; name: string; description: string }[];
  metric: string;
}

export interface Assignment {
  userId: string;
  experimentId: string;
  variant: string;
  assignedAt: string;
}

// Derived metric types
export interface DomainMetrics {
  domain: CognitiveDomain;
  accuracyRate: number;
  medianRt: number;
  rtVariability: number;
  omissionRate: number;
  speedAccuracyTradeoff: number;
  learningRate: number;
  fatigueIndex: number;
  consistency: number;
  zScore: number;
  confidenceLower: number;
  confidenceUpper: number;
  trialCount: number;
}

export interface WeeklyTrend {
  weekStart: string;
  compositeScore: number;
  adherence: number;
  minutesTrained: number;
  domainScores: Record<CognitiveDomain, number>;
  gamesPlayed: number;
}

export interface NarrativeInsight {
  type: 'improvement' | 'decline' | 'milestone' | 'recommendation' | 'pattern';
  icon: string;
  title: string;
  description: string;
  metric?: string;
  delta?: number;
}

export const DOMAINS: { key: CognitiveDomain; label: string; color: string }[] = [
  { key: 'working_memory', label: 'Working Memory', color: 'hsl(var(--brain-purple))' },
  { key: 'inhibitory_control', label: 'Inhibitory Control', color: 'hsl(var(--brain-coral))' },
  { key: 'cognitive_flexibility', label: 'Cognitive Flexibility', color: 'hsl(var(--brain-teal))' },
  { key: 'attention', label: 'Attention', color: 'hsl(var(--brain-blue))' },
  { key: 'processing_speed', label: 'Processing Speed', color: 'hsl(var(--brain-yellow))' },
];

export const GAMES: Game[] = [
  { id: 'n-back', name: 'N-Back', domain: 'working_memory', description: 'Adaptive working memory task. Match current stimulus to n steps back.', version: '1.0' },
  { id: 'stroop', name: 'Stroop Test', domain: 'inhibitory_control', description: 'Name the ink color, not the word. Measures interference control.', version: '1.0' },
  { id: 'task-switch', name: 'Task Switch', domain: 'cognitive_flexibility', description: 'Alternate between rules. Measures cognitive switching cost.', version: '1.0' },
  { id: 'visual-search', name: 'Visual Search', domain: 'attention', description: 'Find the target among distractors. Measures attentional efficiency.', version: '1.0' },
  { id: 'symbol-digit', name: 'Symbol Digit', domain: 'processing_speed', description: 'Match symbols to digits as fast as possible.', version: '1.0' },
];
