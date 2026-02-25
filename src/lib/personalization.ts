import { computeDomainMetrics, getOverviewKPIs } from './analytics';
import { CognitiveDomain, GAMES, DOMAINS } from './types';

export interface TrainingPlanItem {
  gameId: string;
  gameName: string;
  domain: CognitiveDomain;
  domainLabel: string;
  durationMinutes: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  suggestedDifficulty: number;
}

export function generateTrainingPlan(): TrainingPlanItem[] {
  const domainMetrics = computeDomainMetrics();
  const kpis = getOverviewKPIs();
  
  // Sort domains by z-score (weakest first)
  const sortedDomains = [...domainMetrics].sort((a, b) => a.zScore - b.zScore);
  
  const plan: TrainingPlanItem[] = [];
  const usedDomains = new Set<CognitiveDomain>();
  
  // Rule 1: Always include weakest domain
  const weakest = sortedDomains[0];
  const weakGame = GAMES.find(g => g.domain === weakest.domain)!;
  const weakLabel = DOMAINS.find(d => d.key === weakest.domain)?.label || '';
  
  plan.push({
    gameId: weakGame.id,
    gameName: weakGame.name,
    domain: weakest.domain,
    domainLabel: weakLabel,
    durationMinutes: kpis.adherence7d < 50 ? 3 : 5,
    reason: `Weakest domain (z=${weakest.zScore.toFixed(1)}). Targeted practice yields the highest marginal gain.`,
    priority: 'high',
    suggestedDifficulty: Math.max(1, Math.min(8, Math.round(weakest.accuracyRate * 8))),
  });
  usedDomains.add(weakest.domain);

  // Rule 2: Second weakest or medium performer
  const second = sortedDomains.find(d => !usedDomains.has(d.domain))!;
  if (second) {
    const game = GAMES.find(g => g.domain === second.domain)!;
    plan.push({
      gameId: game.id,
      gameName: game.name,
      domain: second.domain,
      domainLabel: DOMAINS.find(d => d.key === second.domain)?.label || '',
      durationMinutes: 4,
      reason: `Secondary focus area (z=${second.zScore.toFixed(1)}). Building balanced cognitive capacity.`,
      priority: 'medium',
      suggestedDifficulty: Math.max(1, Math.min(8, Math.round(second.accuracyRate * 8))),
    });
    usedDomains.add(second.domain);
  }

  // Rule 3: If adherence is low, add a "fun" game (processing speed is typically most engaging)
  if (kpis.adherence7d < 60) {
    const funGame = GAMES.find(g => g.domain === 'processing_speed' && !usedDomains.has(g.domain))
      || GAMES.find(g => !usedDomains.has(g.domain));
    if (funGame) {
      plan.push({
        gameId: funGame.id,
        gameName: funGame.name,
        domain: funGame.domain,
        domainLabel: DOMAINS.find(d => d.key === funGame.domain)?.label || '',
        durationMinutes: 3,
        reason: `Engagement booster. Quick, rewarding exercises improve session completion rates.`,
        priority: 'low',
        suggestedDifficulty: 3,
      });
      usedDomains.add(funGame.domain);
    }
  } else {
    // Rule 4: Add variety - pick a domain not yet used
    const variety = sortedDomains.find(d => !usedDomains.has(d.domain));
    if (variety) {
      const game = GAMES.find(g => g.domain === variety.domain)!;
      plan.push({
        gameId: game.id,
        gameName: game.name,
        domain: variety.domain,
        domainLabel: DOMAINS.find(d => d.key === variety.domain)?.label || '',
        durationMinutes: 4,
        reason: `Variety pick. Cross-domain training prevents cognitive adaptation plateaus.`,
        priority: 'low',
        suggestedDifficulty: Math.max(1, Math.min(8, Math.round(variety.accuracyRate * 8))),
      });
    }
  }

  // Rule 5: If fatigue is high, reduce all difficulties
  const highFatigue = domainMetrics.some(d => d.fatigueIndex > 0.15);
  if (highFatigue) {
    for (const item of plan) {
      item.suggestedDifficulty = Math.max(1, item.suggestedDifficulty - 1);
      if (item.priority === 'high') {
        item.reason += ' (Difficulty reduced due to detected fatigue.)';
      }
    }
  }

  return plan;
}

export function getPersonalizationExplanation(): string {
  const kpis = getOverviewKPIs();
  const domains = computeDomainMetrics();
  const weakest = domains.reduce((a, b) => a.zScore < b.zScore ? a : b);
  const weakLabel = DOMAINS.find(d => d.key === weakest.domain)?.label;

  let explanation = `**Today's plan prioritizes ${weakLabel}** (z-score: ${weakest.zScore.toFixed(1)} vs baseline). `;
  
  if (kpis.adherence7d < 60) {
    explanation += `Your 7-day adherence is ${kpis.adherence7d}%, so we've included a shorter, more engaging session to build consistency. `;
  }
  
  const fatigued = domains.find(d => d.fatigueIndex > 0.15);
  if (fatigued) {
    explanation += `Late-session fatigue detected in ${DOMAINS.find(d => d.key === fatigued.domain)?.label} — difficulty has been adjusted down. `;
  }
  
  explanation += `The plan ensures no more than 2 exercises from the same domain, promoting balanced neural engagement.`;
  
  return explanation;
}
