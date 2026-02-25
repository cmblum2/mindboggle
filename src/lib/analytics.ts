import { getStoredData } from './demoData';
import { CognitiveDomain, DomainMetrics, WeeklyTrend, NarrativeInsight, Trial, DailySummary, DOMAINS, GAMES } from './types';

// --- Utility functions ---
function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / (arr.length - 1));
}

function iqr(arr: number[]): number {
  if (arr.length < 4) return std(arr);
  const s = [...arr].sort((a, b) => a - b);
  const q1 = s[Math.floor(s.length * 0.25)];
  const q3 = s[Math.floor(s.length * 0.75)];
  return q3 - q1;
}

function linearSlope(ys: number[]): number {
  if (ys.length < 2) return 0;
  const n = ys.length;
  const xs = ys.map((_, i) => i);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
}

// --- Main analytics functions ---

export function getOverviewKPIs() {
  const { dailySummaries, trials, events } = getStoredData();
  const last7 = dailySummaries.slice(-7);
  const last30 = dailySummaries.slice(-30);

  const compositeScore = last7.length ? Math.round(last7.reduce((s, d) => s + d.compositeScore, 0) / last7.length) : 0;
  const adherence7d = last7.length ? Math.round(last7.reduce((s, d) => s + d.adherence, 0) / last7.length * 100) : 0;
  
  // Strongest / weakest domain
  const domainAvgs: Record<string, number> = {};
  for (const d of DOMAINS) {
    const scores = last7.map(s => s.domainScores[d.key]).filter(Boolean);
    domainAvgs[d.key] = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
  }
  
  const sorted = Object.entries(domainAvgs).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  // Meaningful change detection
  const first7 = dailySummaries.slice(0, 7);
  const firstAvg = first7.length ? first7.reduce((s, d) => s + d.compositeScore, 0) / first7.length : 50;
  const baselineStd = std(first7.map(d => d.compositeScore));
  const delta = compositeScore - firstAvg;
  const meaningfulChange = Math.abs(delta) > baselineStd * 1.5;

  const totalMinutes = dailySummaries.reduce((s, d) => s + d.minutesTrained, 0);
  const totalGames = dailySummaries.reduce((s, d) => s + d.gamesPlayed, 0);
  const totalTrials = trials.length;
  
  // Streak
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  const dates = [...new Set(dailySummaries.map(d => d.date))].sort().reverse();
  for (const date of dates) {
    const expected = new Date();
    expected.setDate(expected.getDate() - streak);
    if (date === expected.toISOString().split('T')[0] || (streak === 0 && date === today)) {
      streak++;
    } else if (streak === 0) {
      // Check if yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date === yesterday.toISOString().split('T')[0]) {
        streak++;
      } else break;
    } else break;
  }

  // Rage quit rate
  const rageQuits = events.filter(e => e.type === 'rage_quit').length;
  const totalSessions = events.filter(e => e.type === 'session_end').length;
  const rageQuitRate = totalSessions ? rageQuits / totalSessions : 0;

  // Avg session length
  const sessionLengths = last30.map(d => d.minutesTrained / Math.max(1, d.gamesPlayed) * d.gamesPlayed);
  const avgSessionLength = sessionLengths.length ? Math.round(sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length) : 0;

  return {
    compositeScore, adherence7d, streak,
    strongest: { domain: strongest?.[0] as CognitiveDomain, score: Math.round(strongest?.[1] || 0) },
    weakest: { domain: weakest?.[0] as CognitiveDomain, score: Math.round(weakest?.[1] || 0) },
    meaningfulChange, delta: Math.round(delta),
    totalMinutes, totalGames, totalTrials,
    rageQuitRate: Math.round(rageQuitRate * 100),
    avgSessionLength,
  };
}

export function computeDomainMetrics(domain?: CognitiveDomain): DomainMetrics[] {
  const { trials, dailySummaries } = getStoredData();
  const gameIds = GAMES.filter(g => !domain || g.domain === domain).map(g => g.id);
  
  return DOMAINS.filter(d => !domain || d.key === domain).map(d => {
    const domainGames = GAMES.filter(g => g.domain === d.key).map(g => g.id);
    const domainTrials = trials.filter((t: Trial) => domainGames.includes(t.gameId));
    
    if (!domainTrials.length) {
      return {
        domain: d.key, accuracyRate: 0, medianRt: 0, rtVariability: 0,
        omissionRate: 0, speedAccuracyTradeoff: 0, learningRate: 0,
        fatigueIndex: 0, consistency: 0, zScore: 0,
        confidenceLower: -1, confidenceUpper: 1, trialCount: 0,
      };
    }

    const accuracyRate = domainTrials.filter((t: Trial) => t.correct).length / domainTrials.length;
    const rts = domainTrials.map((t: Trial) => t.rtMs);
    const medianRt = median(rts);
    const rtVariability = iqr(rts);
    const omissionRate = domainTrials.filter((t: Trial) => t.rtMs > 1500).length / domainTrials.length;
    
    // Speed-accuracy tradeoff: correlation proxy
    const speedAccuracyTradeoff = accuracyRate * (1 - medianRt / 1500);

    // Learning rate: slope of accuracy over sessions
    const sessionAccuracies = groupBySession(domainTrials);
    const learningRate = linearSlope(sessionAccuracies);

    // Fatigue: compare first 1/3 vs last 1/3 accuracy
    const third = Math.floor(domainTrials.length / 3);
    const earlyAcc = domainTrials.slice(0, third).filter((t: Trial) => t.correct).length / Math.max(1, third);
    const lateAcc = domainTrials.slice(-third).filter((t: Trial) => t.correct).length / Math.max(1, third);
    const fatigueIndex = earlyAcc - lateAcc; // positive = fatigue exists

    // Consistency: rolling std of daily scores
    const dailyScores = dailySummaries.map((s: DailySummary) => s.domainScores[d.key]).filter(Boolean);
    const consistency = dailyScores.length > 2 ? 1 - Math.min(1, std(dailyScores.slice(-10)) / 20) : 0.5;

    // Z-score relative to baseline (first 5 sessions)
    const baseline = dailyScores.slice(0, 5);
    const recent = dailyScores.slice(-5);
    const baselineMean = baseline.length ? baseline.reduce((a: number, b: number) => a + b, 0) / baseline.length : 50;
    const baselineStd = baseline.length > 1 ? std(baseline) : 10;
    const recentMean = recent.length ? recent.reduce((a: number, b: number) => a + b, 0) / recent.length : 50;
    const zScore = baselineStd > 0 ? (recentMean - baselineMean) / baselineStd : 0;

    return {
      domain: d.key,
      accuracyRate: Math.round(accuracyRate * 100) / 100,
      medianRt: Math.round(medianRt),
      rtVariability: Math.round(rtVariability),
      omissionRate: Math.round(omissionRate * 100) / 100,
      speedAccuracyTradeoff: Math.round(speedAccuracyTradeoff * 100) / 100,
      learningRate: Math.round(learningRate * 1000) / 1000,
      fatigueIndex: Math.round(fatigueIndex * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      zScore: Math.round(zScore * 100) / 100,
      confidenceLower: Math.round((zScore - 1.96 / Math.sqrt(Math.max(1, recent.length))) * 100) / 100,
      confidenceUpper: Math.round((zScore + 1.96 / Math.sqrt(Math.max(1, recent.length))) * 100) / 100,
      trialCount: domainTrials.length,
    };
  });
}

function groupBySession(trials: Trial[]): number[] {
  const sessions: Record<string, Trial[]> = {};
  for (const t of trials) {
    if (!sessions[t.sessionId]) sessions[t.sessionId] = [];
    sessions[t.sessionId].push(t);
  }
  return Object.values(sessions).map(ts => ts.filter(t => t.correct).length / ts.length);
}

export function getWeeklyTrends(weeks: number = 8): WeeklyTrend[] {
  const { dailySummaries } = getStoredData();
  const trends: WeeklyTrend[] = [];
  
  const now = new Date();
  for (let w = weeks - 1; w >= 0; w--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    
    const weekData = dailySummaries.filter((d: DailySummary) => d.date >= weekStartStr && d.date <= weekEndStr);
    
    if (!weekData.length) {
      trends.push({
        weekStart: weekStartStr, compositeScore: 0, adherence: 0,
        minutesTrained: 0, domainScores: { working_memory: 0, inhibitory_control: 0, cognitive_flexibility: 0, attention: 0, processing_speed: 0 },
        gamesPlayed: 0,
      });
      continue;
    }

    const domainScores: Record<CognitiveDomain, number> = { working_memory: 0, inhibitory_control: 0, cognitive_flexibility: 0, attention: 0, processing_speed: 0 };
    for (const d of DOMAINS) {
      const scores = weekData.map((s: DailySummary) => s.domainScores[d.key]).filter(Boolean);
      domainScores[d.key] = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
    }

    trends.push({
      weekStart: weekStartStr,
      compositeScore: Math.round(weekData.reduce((s: number, d: DailySummary) => s + d.compositeScore, 0) / weekData.length),
      adherence: Math.round(weekData.reduce((s: number, d: DailySummary) => s + d.adherence, 0) / weekData.length * 100),
      minutesTrained: weekData.reduce((s: number, d: DailySummary) => s + d.minutesTrained, 0),
      domainScores,
      gamesPlayed: weekData.reduce((s: number, d: DailySummary) => s + d.gamesPlayed, 0),
    });
  }
  
  return trends;
}

export function getDailyTrends(days: number = 30): DailySummary[] {
  const { dailySummaries } = getStoredData();
  return dailySummaries.slice(-days);
}

export function generateNarrativeInsights(): NarrativeInsight[] {
  const kpis = getOverviewKPIs();
  const domains = computeDomainMetrics();
  const insights: NarrativeInsight[] = [];

  // Meaningful change
  if (kpis.meaningfulChange) {
    insights.push({
      type: kpis.delta > 0 ? 'improvement' : 'decline',
      icon: kpis.delta > 0 ? '📈' : '📉',
      title: kpis.delta > 0 ? 'Significant Improvement Detected' : 'Performance Dip Noted',
      description: `Your composite score has ${kpis.delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(kpis.delta)} points beyond baseline variability. This change exceeds noise thresholds.`,
      metric: 'compositeScore', delta: kpis.delta,
    });
  }

  // Strongest domain
  const strongDomain = domains.reduce((a, b) => a.zScore > b.zScore ? a : b);
  if (strongDomain.zScore > 0.5) {
    const label = DOMAINS.find(d => d.key === strongDomain.domain)?.label;
    insights.push({
      type: 'improvement', icon: '💪',
      title: `${label} Is Your Strongest Area`,
      description: `Z-score of ${strongDomain.zScore.toFixed(1)} vs baseline (${strongDomain.confidenceLower.toFixed(1)} – ${strongDomain.confidenceUpper.toFixed(1)} CI). Your consistency in this domain is ${Math.round(strongDomain.consistency * 100)}%.`,
    });
  }

  // Weakest domain
  const weakDomain = domains.reduce((a, b) => a.zScore < b.zScore ? a : b);
  if (weakDomain.zScore < strongDomain.zScore) {
    const label = DOMAINS.find(d => d.key === weakDomain.domain)?.label;
    insights.push({
      type: 'recommendation', icon: '🎯',
      title: `Focus Area: ${label}`,
      description: `This domain shows the most room for growth (z=${weakDomain.zScore.toFixed(1)}). Tomorrow's plan will prioritize exercises targeting ${label?.toLowerCase()}.`,
    });
  }

  // Fatigue
  const fatiguedDomains = domains.filter(d => d.fatigueIndex > 0.1);
  if (fatiguedDomains.length > 0) {
    insights.push({
      type: 'pattern', icon: '😴',
      title: 'Late-Session Fatigue Detected',
      description: `Performance drops ${Math.round(fatiguedDomains[0].fatigueIndex * 100)}% in later trials for ${DOMAINS.find(d => d.key === fatiguedDomains[0].domain)?.label}. Consider shorter sessions or breaks.`,
    });
  }

  // Streak
  if (kpis.streak >= 7) {
    insights.push({
      type: 'milestone', icon: '🔥',
      title: `${kpis.streak}-Day Streak!`,
      description: `You've trained consistently for ${kpis.streak} days. Consistent practice is the strongest predictor of cognitive gains.`,
    });
  }

  // Adherence
  if (kpis.adherence7d < 60) {
    insights.push({
      type: 'recommendation', icon: '📅',
      title: 'Adherence Below Target',
      description: `7-day adherence at ${kpis.adherence7d}%. Even 5 minutes of daily training maintains neural adaptation benefits.`,
    });
  }

  return insights.slice(0, 5);
}

export function getLearningCurves(gameId?: string) {
  const { trials } = getStoredData();
  const games = gameId ? GAMES.filter(g => g.id === gameId) : GAMES;
  
  return games.map(game => {
    const gameTrials = trials.filter((t: Trial) => t.gameId === game.id);
    const sessions: Record<string, Trial[]> = {};
    for (const t of gameTrials) {
      if (!sessions[t.sessionId]) sessions[t.sessionId] = [];
      sessions[t.sessionId].push(t);
    }
    
    const sessionData = Object.entries(sessions)
      .map(([sid, ts]) => ({
        sessionId: sid,
        date: ts[0].startedAt.split('T')[0],
        accuracy: ts.filter(t => t.correct).length / ts.length,
        medianRt: median(ts.map(t => t.rtMs)),
        trials: ts.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return { game, sessions: sessionData };
  });
}

export function getTrialsForExplorer(filters?: {
  dateFrom?: string; dateTo?: string; gameId?: string;
  difficulty?: number; correctOnly?: boolean;
}) {
  const { trials } = getStoredData();
  let filtered = [...trials];
  
  if (filters?.dateFrom) filtered = filtered.filter(t => t.startedAt >= filters.dateFrom!);
  if (filters?.dateTo) filtered = filtered.filter(t => t.startedAt <= filters.dateTo! + 'T23:59:59');
  if (filters?.gameId) filtered = filtered.filter(t => t.gameId === filters.gameId);
  if (filters?.difficulty) filtered = filtered.filter(t => t.difficulty === filters.difficulty);
  if (filters?.correctOnly) filtered = filtered.filter(t => t.correct);
  
  return filtered.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function getEventsForExplorer(filters?: { type?: string; dateFrom?: string; dateTo?: string }) {
  const { events } = getStoredData();
  let filtered = [...events];
  if (filters?.type) filtered = filtered.filter(e => e.type === filters.type);
  if (filters?.dateFrom) filtered = filtered.filter(e => e.ts >= filters.dateFrom!);
  if (filters?.dateTo) filtered = filtered.filter(e => e.ts <= filters.dateTo! + 'T23:59:59');
  return filtered.sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 500);
}

export function getExperimentResults() {
  const { experiments, assignments, dailySummaries, events } = getStoredData();
  
  return experiments.map(exp => {
    const expAssignments = assignments.filter(a => a.experimentId === exp.id);
    const variantResults = exp.variants.map(v => {
      const users = expAssignments.filter(a => a.variant === v.id);
      // Simulate results with demo data
      const adherence = 0.6 + Math.random() * 0.3;
      const retention = 0.5 + Math.random() * 0.4;
      const performanceDelta = (Math.random() - 0.3) * 10;
      return {
        variant: v,
        n: Math.max(1, Math.floor(Math.random() * 50 + 10)),
        adherence: Math.round(adherence * 100),
        retention7d: Math.round(retention * 100),
        performanceDelta: Math.round(performanceDelta * 10) / 10,
      };
    });
    return { experiment: exp, results: variantResults };
  });
}

export function getRtDistribution(domain: CognitiveDomain) {
  const { trials } = getStoredData();
  const domainGames = GAMES.filter(g => g.domain === domain).map(g => g.id);
  const rts = trials.filter((t: Trial) => domainGames.includes(t.gameId)).map((t: Trial) => t.rtMs);
  
  // Create histogram buckets
  const bucketSize = 50;
  const buckets: { range: string; count: number; center: number }[] = [];
  const min = Math.floor(Math.min(...rts) / bucketSize) * bucketSize;
  const max = Math.ceil(Math.max(...rts) / bucketSize) * bucketSize;
  
  for (let b = min; b < max; b += bucketSize) {
    buckets.push({
      range: `${b}-${b + bucketSize}`,
      center: b + bucketSize / 2,
      count: rts.filter(r => r >= b && r < b + bucketSize).length,
    });
  }
  
  return buckets;
}
