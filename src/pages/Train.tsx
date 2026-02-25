import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '@/components/NavBar';
import { seedDemoDataIfNeeded } from '@/lib/demoData';
import { generateTrainingPlan, getPersonalizationExplanation } from '@/lib/personalization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DOMAINS, GAMES } from '@/lib/types';
import { Target, Brain, Zap, Play, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Train = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) seedDemoDataIfNeeded(user.id);
  }, [user]);

  const plan = useMemo(() => user ? generateTrainingPlan() : [], [user]);
  const explanation = useMemo(() => user ? getPersonalizationExplanation() : '', [user]);

  if (!user) return null;

  const totalMinutes = plan.reduce((s, p) => s + p.durationMinutes, 0);
  const priorityIcons = { high: <Target className="h-5 w-5 text-red-400" />, medium: <Brain className="h-5 w-5 text-primary" />, low: <Zap className="h-5 w-5 text-brain-yellow" /> };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar isLoggedIn={true} onLogout={() => {}} />
      <main className="flex-1 container px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Today's Training Plan</h1>
          <p className="text-sm text-muted-foreground">
            {plan.length} exercises • ~{totalMinutes} minutes • Personalized for you
          </p>
        </div>

        <Card className="border-primary/20 bg-primary/5 mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {plan.map((item, i) => (
            <Card key={i} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                    {priorityIcons[item.priority]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">{item.gameName}</h3>
                      <Badge variant="outline" className="text-[10px]">{item.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{item.domainLabel} • {item.durationMinutes} min • Difficulty {item.suggestedDifficulty}/8</p>
                    <p className="text-xs text-muted-foreground/70">{item.reason}</p>
                  </div>
                  <Button size="sm" className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-1 shrink-0" onClick={() => navigate(`/games/${item.gameId}`)}>
                    <Play className="h-3 w-3" /> Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/dashboard')}>
            View Full Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Train;
