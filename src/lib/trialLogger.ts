import { Trial, AppEvent, DailySummary, Session, CognitiveDomain, GAMES, DOMAINS } from './types';
import { appendTrials, appendEvents, appendSession, updateDailySummary, getStoredData } from './demoData';

function uuid() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface TrialRecord {
  correct: boolean;
  rtMs: number;
  stimulus: string;
  response: string;
  difficulty: number;
  hintsUsed?: number;
}

export interface GameSessionContext {
  sessionId: string;
  gameId: string;
  userId: string;
  startedAt: string;
  trials: TrialRecord[];
}

export function startGameSession(userId: string, gameId: string): GameSessionContext {
  const sessionId = uuid();
  const startedAt = new Date().toISOString();

  const session: Session = {
    id: sessionId,
    userId,
    startedAt,
    endedAt: null,
    deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
  };
  appendSession(session);

  const startEvent: AppEvent = {
    id: uuid(), userId, sessionId, gameId,
    ts: startedAt, type: 'game_start', payload: {},
  };
  appendEvents([startEvent]);

  return { sessionId, gameId, userId, startedAt, trials: [] };
}

export function logTrial(ctx: GameSessionContext, record: TrialRecord) {
  ctx.trials.push(record);
}

export function endGameSession(ctx: GameSessionContext) {
  const endedAt = new Date().toISOString();
  const { sessionId, gameId, userId, trials } = ctx;

  if (!trials.length) return;

  // Build Trial entities
  const trialEntities: Trial[] = trials.map((t, i) => ({
    id: uuid(),
    sessionId,
    gameId,
    startedAt: new Date(Date.now() - (trials.length - i) * 2500).toISOString(),
    endedAt: new Date(Date.now() - (trials.length - i) * 2500 + t.rtMs).toISOString(),
    stimulus: t.stimulus,
    response: t.response,
    correct: t.correct,
    rtMs: Math.round(t.rtMs),
    difficulty: t.difficulty,
    hintsUsed: t.hintsUsed || 0,
  }));
  appendTrials(trialEntities);

  // Game end event
  const accuracy = trials.filter(t => t.correct).length / trials.length;
  const medianRt = median(trials.map(t => t.rtMs));
  const endEvent: AppEvent = {
    id: uuid(), userId, sessionId, gameId,
    ts: endedAt, type: 'game_end',
    payload: { accuracy, medianRt, trials: trials.length, difficulty: trials[0]?.difficulty || 1 },
  };
  const sessionEndEvent: AppEvent = {
    id: uuid(), userId, sessionId,
    ts: endedAt, type: 'session_end',
    payload: { duration: (Date.now() - new Date(ctx.startedAt).getTime()) / 60000 },
  };
  appendEvents([endEvent, sessionEndEvent]);

  // Update daily summary
  const today = new Date().toISOString().split('T')[0];
  const game = GAMES.find(g => g.id === gameId);
  const domain = game?.domain || 'working_memory';

  const domainScore = Math.round(
    accuracy * 60 + (1 - Math.min(medianRt, 1200) / 1200) * 40
  );

  const stored = getStoredData();
  const existingSummary = stored.dailySummaries.find(
    (s: DailySummary) => s.date === today && s.userId === userId
  );

  if (existingSummary) {
    existingSummary.gamesPlayed += 1;
    existingSummary.minutesTrained += Math.round(trials.length * 2.5 / 60);
    existingSummary.domainScores[domain] = Math.round(
      (existingSummary.domainScores[domain] + domainScore) / 2
    );
    // Recompute composite
    const scores = Object.values(existingSummary.domainScores);
    existingSummary.compositeScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    existingSummary.adherence = Math.min(1, existingSummary.gamesPlayed / 3);
    updateDailySummary(existingSummary);
  } else {
    const domainScores: Record<CognitiveDomain, number> = {
      working_memory: 50, inhibitory_control: 50, cognitive_flexibility: 50,
      attention: 50, processing_speed: 50,
    };
    domainScores[domain] = domainScore;

    const summary: DailySummary = {
      userId, date: today,
      minutesTrained: Math.round(trials.length * 2.5 / 60),
      gamesPlayed: 1,
      adherence: 1 / 3,
      compositeScore: Math.round(Object.values(domainScores).reduce((a, b) => a + b, 0) / 5),
      domainScores,
    };
    updateDailySummary(summary);
  }
}

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
