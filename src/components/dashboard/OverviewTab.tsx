import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOverviewKPIs, getWeeklyTrends, getDailyTrends, generateNarrativeInsights } from '@/lib/analytics';
import { DOMAINS } from '@/lib/types';
import { Trophy, Flame, Target, TrendingUp, TrendingDown, Clock, Gamepad2, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, BarChart, Bar } from 'recharts';

const OverviewTab = () => {
  const kpis = useMemo(() => getOverviewKPIs(), []);
  const weeklyTrends = useMemo(() => getWeeklyTrends(), []);
  const dailyTrends = useMemo(() => getDailyTrends(30), []);
  const insights = useMemo(() => generateNarrativeInsights(), []);

  const radarData = useMemo(() => {
    const last7 = dailyTrends.slice(-7);
    return DOMAINS.map(d => ({
      domain: d.label.split(' ').map(w => w[0]).join(''),
      fullName: d.label,
      score: last7.length ? Math.round(last7.reduce((s, day) => s + (day.domainScores[d.key] || 0), 0) / last7.length) : 0,
    }));
  }, [dailyTrends]);

  const weakLabel = DOMAINS.find(d => d.key === kpis.weakest.domain)?.label || '';
  const strongLabel = DOMAINS.find(d => d.key === kpis.strongest.domain)?.label || '';

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard icon={<Activity className="h-5 w-5 text-primary" />} label="Cognitive Fitness" value={kpis.compositeScore} suffix="/100" trend={kpis.meaningfulChange ? kpis.delta : undefined} />
        <KPICard icon={<Target className="h-5 w-5 text-accent" />} label="7-Day Adherence" value={kpis.adherence7d} suffix="%" />
        <KPICard icon={<Flame className="h-5 w-5 text-brain-coral" />} label="Streak" value={kpis.streak} suffix=" days" />
        <KPICard icon={<Clock className="h-5 w-5 text-brain-blue" />} label="Total Training" value={kpis.totalMinutes} suffix=" min" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Strongest" value={strongLabel} sub={`${kpis.strongest.score}/100`} />
        <MiniStat label="Focus Area" value={weakLabel} sub={`${kpis.weakest.score}/100`} />
        <MiniStat label="Total Games" value={kpis.totalGames.toString()} sub={`${kpis.totalTrials.toLocaleString()} trials`} />
        <MiniStat label="Avg Session" value={`${kpis.avgSessionLength}m`} sub={`${kpis.rageQuitRate}% quit rate`} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Composite Score Trend */}
        <Card className="md:col-span-2 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Composite Score Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyTrends.map(d => ({ date: d.date.slice(5), score: d.compositeScore }))}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#scoreGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Domain Radar (7-day avg)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Adherence + Minutes */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Adherence & Training Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyTrends.map(w => ({ week: w.weekStart.slice(5), adherence: w.adherence, minutes: w.minutesTrained }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="adherence" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Adherence %" />
                <Bar dataKey="minutes" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Narrative Insights */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">What Changed? — Auto-Generated Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                <span className="text-lg shrink-0">{insight.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function KPICard({ icon, label, value, suffix, trend }: { icon: React.ReactNode; label: string; value: number; suffix: string; trend?: number }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          {icon}
          {trend !== undefined && (
            <span className={`text-xs font-medium flex items-center gap-0.5 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend > 0 ? '+' : ''}{trend}
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-foreground">{value}<span className="text-sm font-normal text-muted-foreground">{suffix}</span></div>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-3 rounded-lg bg-card border border-border/50">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export default OverviewTab;
