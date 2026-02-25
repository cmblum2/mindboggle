import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLearningCurves, computeDomainMetrics } from '@/lib/analytics';
import { generateTrainingPlan, getPersonalizationExplanation } from '@/lib/personalization';
import { DOMAINS, GAMES } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Brain, Zap, Target } from 'lucide-react';

const TrainingInsightsTab = () => {
  const learningCurves = useMemo(() => getLearningCurves(), []);
  const domainMetrics = useMemo(() => computeDomainMetrics(), []);
  const plan = useMemo(() => generateTrainingPlan(), []);
  const explanation = useMemo(() => getPersonalizationExplanation(), []);

  // Flatten learning curve data for charts
  const accuracyData = useMemo(() => {
    const maxLen = Math.max(...learningCurves.map(c => c.sessions.length));
    const data: any[] = [];
    for (let i = 0; i < Math.min(maxLen, 30); i++) {
      const point: any = { session: i + 1 };
      for (const curve of learningCurves) {
        if (curve.sessions[i]) {
          point[curve.game.id] = Math.round(curve.sessions[i].accuracy * 100);
        }
      }
      data.push(point);
    }
    return data;
  }, [learningCurves]);

  const rtData = useMemo(() => {
    const maxLen = Math.max(...learningCurves.map(c => c.sessions.length));
    const data: any[] = [];
    for (let i = 0; i < Math.min(maxLen, 30); i++) {
      const point: any = { session: i + 1 };
      for (const curve of learningCurves) {
        if (curve.sessions[i]) {
          point[curve.game.id] = Math.round(curve.sessions[i].medianRt);
        }
      }
      data.push(point);
    }
    return data;
  }, [learningCurves]);

  const gameColors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--brain-coral))', 'hsl(var(--brain-yellow))', 'hsl(var(--brain-blue))'];

  const priorityIcons = { high: <Target className="h-4 w-4 text-red-400" />, medium: <Brain className="h-4 w-4 text-primary" />, low: <Zap className="h-4 w-4 text-brain-yellow" /> };

  return (
    <div className="space-y-6">
      {/* Recommended Focus Panel */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommended Focus — Why Tomorrow's Plan Picks These Domains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          <div className="grid gap-3 md:grid-cols-3">
            {plan.map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-card border border-border/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {priorityIcons[item.priority]}
                    <span className="text-sm font-medium text-foreground">{item.gameName}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{item.durationMinutes}m</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{item.domainLabel} • Difficulty {item.suggestedDifficulty}/8</p>
                <p className="text-[10px] text-muted-foreground/70">{item.reason}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Accuracy Learning Curves */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Learning Curves — Accuracy (%) by Session</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="session" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Session #', position: 'bottom', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {GAMES.map((g, i) => (
                  <Line key={g.id} type="monotone" dataKey={g.id} stroke={gameColors[i]} strokeWidth={1.5} dot={false} name={g.name} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* RT Learning Curves */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Learning Curves — Median RT (ms) by Session</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={rtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="session" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Session #', position: 'bottom', fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {GAMES.map((g, i) => (
                  <Line key={g.id} type="monotone" dataKey={g.id} stroke={gameColors[i]} strokeWidth={1.5} dot={false} name={g.name} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fatigue & Consistency */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Fatigue & Consistency Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {domainMetrics.map(m => {
              const label = DOMAINS.find(d => d.key === m.domain)?.label || '';
              const fatigueLevel = m.fatigueIndex > 0.15 ? 'High' : m.fatigueIndex > 0.05 ? 'Moderate' : 'Low';
              const fatigueColor = m.fatigueIndex > 0.15 ? 'text-red-400' : m.fatigueIndex > 0.05 ? 'text-orange-400' : 'text-green-400';
              return (
                <div key={m.domain} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Fatigue</span>
                      <span className={fatigueColor}>{fatigueLevel}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${m.fatigueIndex > 0.15 ? 'bg-red-400' : m.fatigueIndex > 0.05 ? 'bg-orange-400' : 'bg-green-400'}`} style={{ width: `${Math.min(100, m.fatigueIndex * 500)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                      <span>Consistency</span>
                      <span className="text-foreground">{Math.round(m.consistency * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${m.consistency * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingInsightsTab;
