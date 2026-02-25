import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { computeDomainMetrics, getRtDistribution } from '@/lib/analytics';
import { DOMAINS, CognitiveDomain } from '@/lib/types';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ErrorBar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CognitiveProfileTab = () => {
  const metrics = useMemo(() => computeDomainMetrics(), []);
  const [selectedDomain, setSelectedDomain] = useState<CognitiveDomain>('working_memory');
  const rtDist = useMemo(() => getRtDistribution(selectedDomain), [selectedDomain]);

  const radarData = metrics.map(m => ({
    domain: DOMAINS.find(d => d.key === m.domain)?.label.split(' ').map(w => w[0]).join('') || '',
    fullName: DOMAINS.find(d => d.key === m.domain)?.label || '',
    zScore: Math.round((m.zScore + 2) * 25), // normalize to 0-100 for display
    rawZ: m.zScore,
  }));

  const comparisonData = metrics.map(m => {
    const label = DOMAINS.find(d => d.key === m.domain)?.label || '';
    return {
      domain: label.length > 12 ? label.slice(0, 12) + '…' : label,
      baseline: 50,
      current: Math.round(50 + m.zScore * 15),
      lower: Math.round(50 + m.confidenceLower * 15),
      upper: Math.round(50 + m.confidenceUpper * 15),
      errorY: [Math.round(50 + m.zScore * 15) - Math.round(50 + m.confidenceLower * 15), Math.round(50 + m.confidenceUpper * 15) - Math.round(50 + m.zScore * 15)],
    };
  });

  return (
    <div className="space-y-6">
      {/* Domain metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {metrics.map(m => {
          const d = DOMAINS.find(dm => dm.key === m.domain)!;
          return (
            <Card key={m.domain} className="border-border/50 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelectedDomain(m.domain)}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{d.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-foreground">{m.zScore > 0 ? '+' : ''}{m.zScore.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">z</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] py-0">{Math.round(m.accuracyRate * 100)}% acc</Badge>
                  <Badge variant="outline" className="text-[10px] py-0">{m.medianRt}ms RT</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  CI: [{m.confidenceLower.toFixed(1)}, {m.confidenceUpper.toFixed(1)}]
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Radar */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Domain Z-Scores vs Baseline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="zScore" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Baseline vs Current */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Baseline vs Current (with 95% CI)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="domain" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="baseline" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Baseline" />
                <Bar dataKey="current" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Current" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* RT Distribution */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reaction Time Distribution</CardTitle>
            <Select value={selectedDomain} onValueChange={(v) => setSelectedDomain(v as CognitiveDomain)}>
              <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOMAINS.map(d => <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rtDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="center" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'RT (ms)', position: 'bottom', fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="count" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed metrics table */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Detailed Domain Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Domain</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Accuracy</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Med. RT</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">RT IQR</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Learning</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Fatigue</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Consistency</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Trials</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m.domain} className="border-b border-border/20 hover:bg-muted/20">
                    <td className="py-2 px-2 font-medium text-foreground">{DOMAINS.find(d => d.key === m.domain)?.label}</td>
                    <td className="text-right py-2 px-2">{Math.round(m.accuracyRate * 100)}%</td>
                    <td className="text-right py-2 px-2">{m.medianRt}ms</td>
                    <td className="text-right py-2 px-2">{m.rtVariability}ms</td>
                    <td className="text-right py-2 px-2">
                      <span className={m.learningRate > 0 ? 'text-green-400' : 'text-red-400'}>{m.learningRate > 0 ? '+' : ''}{(m.learningRate * 100).toFixed(1)}%</span>
                    </td>
                    <td className="text-right py-2 px-2">
                      <span className={m.fatigueIndex > 0.1 ? 'text-orange-400' : 'text-green-400'}>{Math.round(m.fatigueIndex * 100)}%</span>
                    </td>
                    <td className="text-right py-2 px-2">{Math.round(m.consistency * 100)}%</td>
                    <td className="text-right py-2 px-2 text-muted-foreground">{m.trialCount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CognitiveProfileTab;
