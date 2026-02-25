import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getExperimentResults } from '@/lib/analytics';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ExperimentsTab = () => {
  const results = useMemo(() => getExperimentResults(), []);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-brain-yellow/10 border border-brain-yellow/20 flex gap-3 items-start">
        <AlertTriangle className="h-5 w-5 text-brain-yellow shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Experiment Results — Interpret With Caution</p>
          <p className="text-xs text-muted-foreground mt-1">
            These are observational comparisons with small sample sizes. Results are directional, not statistically significant. 
            Proper A/B testing requires larger samples, randomization checks, and correction for multiple comparisons.
          </p>
        </div>
      </div>

      {results.map(({ experiment, results: variantResults }) => (
        <Card key={experiment.id} className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-medium text-foreground">{experiment.name}</CardTitle>
              </div>
              <Badge variant={experiment.status === 'running' ? 'default' : 'secondary'} className="text-xs">
                {experiment.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {experiment.startDate} → {experiment.endDate || 'ongoing'} • Metric: {experiment.metric}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Variant cards */}
              <div className="space-y-3">
                {variantResults.map((vr, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{vr.variant.name}</span>
                      <span className="text-xs text-muted-foreground">n={vr.n}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">{vr.variant.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Adherence</p>
                        <p className="font-medium text-foreground">{vr.adherence}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">7d Retention</p>
                        <p className="font-medium text-foreground">{vr.retention7d}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Perf Δ</p>
                        <p className={`font-medium ${vr.performanceDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {vr.performanceDelta > 0 ? '+' : ''}{vr.performanceDelta}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={variantResults.map(vr => ({ name: vr.variant.name, adherence: vr.adherence, retention: vr.retention7d }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Bar dataKey="adherence" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Adherence %" />
                    <Bar dataKey="retention" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Retention %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExperimentsTab;
