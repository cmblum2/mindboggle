import { Session, Trial, AppEvent, DailySummary, Experiment, Assignment, CognitiveDomain, GAMES } from './types';

const DEMO_USER_ID = 'demo-user';

function uuid() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function gaussRandom(mean: number, std: number) {
  const u = 1 - Math.random();
  const v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

export function generateDemoData(userId: string = DEMO_USER_ID, days: number = 60) {
  const sessions: Session[] = [];
  const trials: Trial[] = [];
  const events: AppEvent[] = [];
  const dailySummaries: DailySummary[] = [];

  const now = new Date();
  const baselineDay = new Date(now);
  baselineDay.setDate(baselineDay.getDate() - days);

  // Simulate learning curves per domain
  const domainBaselines: Record<CognitiveDomain, { acc: number; rt: number }> = {
    working_memory: { acc: 0.55, rt: 850 },
    inhibitory_control: { acc: 0.6, rt: 700 },
    cognitive_flexibility: { acc: 0.5, rt: 900 },
    attention: { acc: 0.65, rt: 600 },
    processing_speed: { acc: 0.7, rt: 500 },
  };

  const learningRates: Record<CognitiveDomain, number> = {
    working_memory: 0.004,
    inhibitory_control: 0.003,
    cognitive_flexibility: 0.005,
    attention: 0.002,
    processing_speed: 0.006,
  };

  for (let d = 0; d < days; d++) {
    const date = new Date(baselineDay);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    // Skip ~15% of days for realism (missed days)
    if (Math.random() < 0.15 && d > 5) continue;

    const sessionsPerDay = Math.random() < 0.3 ? 2 : 1;
    let dayMinutes = 0;
    let dayGames = 0;
    const dayDomainScores: Record<CognitiveDomain, number[]> = {
      working_memory: [], inhibitory_control: [], cognitive_flexibility: [],
      attention: [], processing_speed: [],
    };

    for (let s = 0; s < sessionsPerDay; s++) {
      const sessionStart = new Date(date);
      sessionStart.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
      
      const sessionId = uuid();
      const gamesInSession = 2 + Math.floor(Math.random() * 3);
      const sessionDuration = gamesInSession * (3 + Math.random() * 4); // minutes
      
      const sessionEnd = new Date(sessionStart.getTime() + sessionDuration * 60000);

      sessions.push({
        id: sessionId, userId, startedAt: sessionStart.toISOString(),
        endedAt: sessionEnd.toISOString(),
        deviceType: Math.random() < 0.6 ? 'desktop' : 'mobile',
        moodPre: Math.ceil(Math.random() * 5),
        sleep: clamp(gaussRandom(7, 1.5), 3, 10),
        stress: Math.ceil(Math.random() * 5),
      });

      events.push({ id: uuid(), userId, sessionId, ts: sessionStart.toISOString(), type: 'session_start', payload: {} });

      // Pick random games
      const shuffled = [...GAMES].sort(() => Math.random() - 0.5);
      const selectedGames = shuffled.slice(0, gamesInSession);

      for (const game of selectedGames) {
        const gameStart = new Date(sessionStart.getTime() + Math.random() * sessionDuration * 30000);
        const trialCount = 15 + Math.floor(Math.random() * 25);
        const bl = domainBaselines[game.domain];
        const lr = learningRates[game.domain];
        
        // Learning effect
        const dayEffect = d * lr;
        const accBase = clamp(bl.acc + dayEffect, 0.3, 0.95);
        const rtBase = clamp(bl.rt - d * 3, 300, 1200);
        
        const difficulty = clamp(1 + Math.floor(d / 10), 1, 8);

        events.push({ id: uuid(), userId, sessionId, gameId: game.id, ts: gameStart.toISOString(), type: 'game_start', payload: { difficulty } });

        let trialAcc = 0;
        let trialRts: number[] = [];

        for (let t = 0; t < trialCount; t++) {
          const trialStart = new Date(gameStart.getTime() + t * 2500);
          // Fatigue effect: accuracy drops slightly in later trials
          const fatigueEffect = t > trialCount * 0.7 ? -0.05 : 0;
          const correct = Math.random() < (accBase + fatigueEffect + gaussRandom(0, 0.08));
          const rt = clamp(rtBase + gaussRandom(0, 80) + (t > trialCount * 0.7 ? 50 : 0), 150, 2000);
          
          if (correct) trialAcc++;
          trialRts.push(rt);

          trials.push({
            id: uuid(), sessionId, gameId: game.id,
            startedAt: trialStart.toISOString(),
            endedAt: new Date(trialStart.getTime() + rt).toISOString(),
            stimulus: `stim_${t}`, response: correct ? 'correct' : 'incorrect',
            correct, rtMs: Math.round(rt), difficulty,
            hintsUsed: !correct && Math.random() < 0.1 ? 1 : 0,
          });
        }

        const gameEnd = new Date(gameStart.getTime() + trialCount * 2500);
        const accRate = trialAcc / trialCount;
        
        events.push({
          id: uuid(), userId, sessionId, gameId: game.id,
          ts: gameEnd.toISOString(), type: 'game_end',
          payload: { accuracy: accRate, medianRt: median(trialRts), trials: trialCount, difficulty },
        });

        // Convert to z-score-like domain score (0-100 scale for display)
        const domainScore = clamp(Math.round(accRate * 60 + (1 - median(trialRts) / 1200) * 40), 0, 100);
        dayDomainScores[game.domain].push(domainScore);
        dayGames++;
        dayMinutes += trialCount * 2.5 / 60;
      }

      // Rage quit ~5% of sessions
      if (Math.random() < 0.05) {
        events.push({ id: uuid(), userId, sessionId, ts: sessionEnd.toISOString(), type: 'rage_quit', payload: { game: selectedGames[0]?.id } });
      }

      events.push({ id: uuid(), userId, sessionId, ts: sessionEnd.toISOString(), type: 'session_end', payload: { duration: sessionDuration } });
    }

    // Daily summary
    const domainScores: Record<CognitiveDomain, number> = {
      working_memory: avg(dayDomainScores.working_memory) || 50,
      inhibitory_control: avg(dayDomainScores.inhibitory_control) || 50,
      cognitive_flexibility: avg(dayDomainScores.cognitive_flexibility) || 50,
      attention: avg(dayDomainScores.attention) || 50,
      processing_speed: avg(dayDomainScores.processing_speed) || 50,
    };

    const compositeScore = Object.values(domainScores).reduce((a, b) => a + b, 0) / 5;

    dailySummaries.push({
      userId, date: dateStr,
      minutesTrained: Math.round(dayMinutes),
      gamesPlayed: dayGames,
      adherence: dayGames >= 3 ? 1 : dayGames / 3,
      compositeScore: Math.round(compositeScore),
      domainScores,
    });
  }

  // Experiments
  const experiments: Experiment[] = [
    {
      id: 'exp-adaptive-v2', name: 'Adaptive Difficulty v2 vs v1',
      status: 'running',
      startDate: new Date(now.getTime() - 14 * 86400000).toISOString().split('T')[0],
      endDate: null,
      variants: [
        { id: 'control', name: 'v1 Linear', description: 'Difficulty increases linearly with session count' },
        { id: 'treatment', name: 'v2 Performance-Based', description: 'Difficulty adjusts based on rolling accuracy' },
      ],
      metric: 'adherence',
    },
    {
      id: 'exp-nudge', name: 'Streak Nudge Notifications',
      status: 'completed',
      startDate: new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0],
      endDate: new Date(now.getTime() - 10 * 86400000).toISOString().split('T')[0],
      variants: [
        { id: 'off', name: 'No Nudge', description: 'No streak reminder notifications' },
        { id: 'on', name: 'Nudge On', description: 'Daily streak reminder at 7pm' },
      ],
      metric: 'retention_7d',
    },
  ];

  const assignments: Assignment[] = [
    { userId, experimentId: 'exp-adaptive-v2', variant: 'treatment', assignedAt: experiments[0].startDate },
    { userId, experimentId: 'exp-nudge', variant: 'on', assignedAt: experiments[1].startDate },
  ];

  return { sessions, trials, events, dailySummaries, experiments, assignments };
}

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Storage keys
const STORAGE_KEYS = {
  sessions: 'mb_sessions',
  trials: 'mb_trials',
  events: 'mb_events',
  dailySummaries: 'mb_daily_summaries',
  experiments: 'mb_experiments',
  assignments: 'mb_assignments',
  seeded: 'mb_demo_seeded',
};

export function seedDemoDataIfNeeded(userId: string) {
  const seeded = localStorage.getItem(STORAGE_KEYS.seeded);
  if (seeded === userId) return;

  const data = generateDemoData(userId);
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(data.sessions));
  localStorage.setItem(STORAGE_KEYS.trials, JSON.stringify(data.trials));
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(data.events));
  localStorage.setItem(STORAGE_KEYS.dailySummaries, JSON.stringify(data.dailySummaries));
  localStorage.setItem(STORAGE_KEYS.experiments, JSON.stringify(data.experiments));
  localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(data.assignments));
  localStorage.setItem(STORAGE_KEYS.seeded, userId);
}

export function getStoredData() {
  return {
    sessions: JSON.parse(localStorage.getItem(STORAGE_KEYS.sessions) || '[]') as Session[],
    trials: JSON.parse(localStorage.getItem(STORAGE_KEYS.trials) || '[]') as Trial[],
    events: JSON.parse(localStorage.getItem(STORAGE_KEYS.events) || '[]') as AppEvent[],
    dailySummaries: JSON.parse(localStorage.getItem(STORAGE_KEYS.dailySummaries) || '[]') as DailySummary[],
    experiments: JSON.parse(localStorage.getItem(STORAGE_KEYS.experiments) || '[]') as Experiment[],
    assignments: JSON.parse(localStorage.getItem(STORAGE_KEYS.assignments) || '[]') as Assignment[],
  };
}

export function appendTrials(newTrials: Trial[]) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.trials) || '[]');
  localStorage.setItem(STORAGE_KEYS.trials, JSON.stringify([...existing, ...newTrials]));
}

export function appendEvents(newEvents: AppEvent[]) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.events) || '[]');
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify([...existing, ...newEvents]));
}

export function appendSession(session: Session) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.sessions) || '[]');
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify([...existing, session]));
}

export function updateDailySummary(summary: DailySummary) {
  const existing: DailySummary[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.dailySummaries) || '[]');
  const idx = existing.findIndex(s => s.date === summary.date && s.userId === summary.userId);
  if (idx >= 0) existing[idx] = summary; else existing.push(summary);
  localStorage.setItem(STORAGE_KEYS.dailySummaries, JSON.stringify(existing));
}
