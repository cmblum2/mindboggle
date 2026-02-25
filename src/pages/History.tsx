import { useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '@/components/NavBar';
import { seedDemoDataIfNeeded, getStoredData } from '@/lib/demoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GAMES } from '@/lib/types';
import { Calendar } from 'lucide-react';

const History = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) seedDemoDataIfNeeded(user.id);
  }, [user]);

  const data = useMemo(() => {
    if (!user) return { summaries: [], sessions: [] };
    const stored = getStoredData();
    return {
      summaries: stored.dailySummaries.sort((a, b) => b.date.localeCompare(a.date)),
      sessions: stored.sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 50),
    };
  }, [user]);

  // Build calendar data for last 60 days
  const calendarDays = useMemo(() => {
    const days: { date: string; active: boolean; score: number }[] = [];
    const now = new Date();
    for (let i = 59; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const summary = data.summaries.find(s => s.date === dateStr);
      days.push({ date: dateStr, active: !!summary, score: summary?.compositeScore || 0 });
    }
    return days;
  }, [data.summaries]);

  if (!user) return null;




  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar isLoggedIn={true} onLogout={() => {}} />
      <main className="flex-1 container px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" /> Training History
        </h1>

        {/* Activity Calendar */}
        <Card className="border-border/50 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last 60 Days Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm border ${
                    day.active
                      ? day.score > 70 ? 'bg-primary border-primary/50'
                        : day.score > 50 ? 'bg-primary/60 border-primary/30'
                        : 'bg-primary/30 border-primary/20'
                      : 'bg-muted/20 border-border/30'
                  }`}
                  title={`${day.date}: ${day.active ? `Score ${day.score}` : 'No activity'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-muted/20 border border-border/30" />
              <div className="w-3 h-3 rounded-sm bg-primary/30 border border-primary/20" />
              <div className="w-3 h-3 rounded-sm bg-primary/60 border border-primary/30" />
              <div className="w-3 h-3 rounded-sm bg-primary border border-primary/50" />
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Session list */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Duration</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Device</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Mood</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Sleep</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map(s => {
                    const duration = s.endedAt ? Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000) : 0;
                    return (
                      <tr key={s.id} className="border-b border-border/10 hover:bg-muted/10">
                        <td className="py-1.5 px-3">{new Date(s.startedAt).toLocaleDateString()}</td>
                        <td className="py-1.5 px-3">{duration}m</td>
                        <td className="py-1.5 px-3 capitalize">{s.deviceType}</td>
                        <td className="py-1.5 px-3">{s.moodPre ? '⭐'.repeat(s.moodPre) : '—'}</td>
                        <td className="py-1.5 px-3">{s.sleep ? `${s.sleep.toFixed(1)}h` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default History;
